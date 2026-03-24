const Stripe = require("stripe");
const Order = require("../models/order");
const Cart = require("../models/cartModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const { session_id } = req.body;

    if (!session_id) {
        return next(new ErrorHandler("Session id is required", 400));
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    const cart = await Cart.findOne({ user: req.user.id })
        .populate({ path: "items.foodItem", select: "name price images stock" })
        .populate({ path: "restaurant", select: "name" });

    if (!cart) {
        return next(new ErrorHandler("Cart not found", 404));
    }

    const deliveryAddress = session.shipping_details?.address || {};
    const customerDetails = session.customer_details || {};

    const orderItems = cart.items.map((item) => ({
        name: item.foodItem.name,
        quantity: item.quantity,
        image: item.foodItem.images?.[0]?.url || "",
        price: item.foodItem.price,
        fooditem: item.foodItem._id,
    }));

    const order = await Order.create({
        deliveryInfo: {
            address: `${deliveryAddress.line1 || ""} ${deliveryAddress.line2 || ""}`.trim(),
            city: deliveryAddress.city || "",
            phoneNo: customerDetails.phone || "",
            postalCode: deliveryAddress.postal_code || "",
            country: deliveryAddress.country || "",
        },
        restaurant: cart.restaurant?._id,
        user: req.user.id,
        orderItems,
        paymentInfo: {
            id: session.payment_intent,
            status: session.payment_status,
        },
        paidAt: Date.now(),
        itemsPrice: (session.amount_subtotal || 0) / 100,
        deliveryCharge: (session.total_details?.amount_shipping || 0) / 100,
        finalTotal: (session.amount_total || 0) / 100,
    });

    await Cart.findOneAndDelete({ user: req.user.id });

    res.status(200).json({
        success: true,
        order,
    });
});

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate("user", "name email")
        .populate("restaurant", "name")
        .populate("orderItems.fooditem", "name images price");

    if (!order) {
        return next(new ErrorHandler("No Order found with this ID", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});

exports.myOrders = catchAsyncErrors(async (req, res) => {
    const orders = await Order.find({ user: req.user.id })
        .populate("user", "name email")
        .populate("restaurant", "name")
        .populate("orderItems.fooditem", "name images price")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        orders,
    });
});

exports.getAllOrders = catchAsyncErrors(async (req, res) => {
    const orders = await Order.find()
        .populate("user", "name email")
        .populate("restaurant", "name")
        .populate("orderItems.fooditem", "name images price")
        .sort({ createdAt: -1 });

    const totalAmount = orders.reduce((sum, order) => sum + order.finalTotal, 0);

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});
