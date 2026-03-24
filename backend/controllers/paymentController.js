const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

const buildLineItems = (items) => {
  return items.map((item) => {
    const foodItem = item.foodItem || {};
    const unitAmount = Math.round(Number(foodItem.price || 0) * 100);
    const imageUrl =
      foodItem.image?.[0]?.url ||
      foodItem.images?.[0]?.url ||
      foodItem.image?.url ||
      null;

    const productData = {
      name: foodItem.name || "Food Item",
    };

    if (imageUrl) {
      productData.images = [imageUrl];
    }

    return {
      price_data: {
        currency: "inr",
        product_data: productData,
        unit_amount: unitAmount,
      },
      quantity: item.quantity || 1,
    };
  });
};

const processPayment = catchAsyncErrors(async (req, res, next) => {
  const { items, restaurant } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return next(new ErrorHandler("Cart items are required", 400));
  }

  if (!restaurant) {
    return next(new ErrorHandler("Restaurant details are required", 400));
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: req.user.email,
    phone_number_collection: { enabled: true },
    line_items: buildLineItems(items),
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["US", "IN"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery Charges",
          type: "fixed_amount",
          fixed_amount: {
            amount: 5500,
            currency: "inr",
          },
          delivery_estimate: {
            minimum: {
              unit: "hour",
              value: 1,
            },
            maximum: {
              unit: "hour",
              value: 3,
            },
          },
        },
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cart`,
  });

  res.status(200).json({ url: session.url });
});

const getStripeApiKey = catchAsyncErrors(async (req, res) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY,
  });
});

module.exports = {
  processPayment,
  sendStripApi: getStripeApiKey,
  getStripeApiKey,
};
