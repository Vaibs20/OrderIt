const Cart = require("../models/cartModel");
const FoodItem = require("../models/foodItem");
const Restaurant = require("../models/restaurant");

const buildCartResponse = async (userId) => {
    return Cart.findOne({ user: userId })
        .populate({ path: "items.foodItem", select: "name price images stock" })
        .populate({ path: "restaurant", select: "name" });
};

exports.addItemToCart = async (req, res) => {
    try {
        const { foodItemId, restaurantId, quantity } = req.body;
        const userId = req.user.id;

        const foodItem = await FoodItem.findById(foodItemId);
        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        let cart = await Cart.findOne({ user: userId });

        if (cart && cart.restaurant.toString() !== restaurantId) {
            await Cart.deleteOne({ _id: cart._id });
            cart = null;
        }

        if (!cart) {
            cart = new Cart({
                user: userId,
                restaurant: restaurantId,
                items: [{ foodItem: foodItemId, quantity }],
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (item) => item.foodItem.toString() === foodItemId
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ foodItem: foodItemId, quantity });
            }
        }

        await cart.save();

        const populatedCart = await buildCartResponse(userId);

        res.status(200).json({
            message: "Cart updated",
            cart: populatedCart,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error,
        });
    }
};

exports.updateCartItemQuantity = async (req, res) => {
    try {
        const { foodItemId, quantity } = req.body;
        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.foodItem.toString() === foodItemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Food item not found in cart" });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        const populatedCart = await buildCartResponse(userId);

        res.status(200).json({
            message: "Cart item quantity updated",
            cart: populatedCart,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error,
        });
    }
};

exports.deleteCartItem = async (req, res) => {
    try {
        const { foodItemId } = req.body;
        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.foodItem.toString() === foodItemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Food item not found in cart" });
        }

        cart.items.splice(itemIndex, 1);

        if (cart.items.length === 0) {
            await Cart.deleteOne({ _id: cart._id });
            return res.status(200).json({
                message: "Cart deleted",
            });
        }

        await cart.save();
        const populatedCart = await buildCartResponse(userId);

        res.status(200).json({
            message: "Cart item deleted",
            cart: populatedCart,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error,
        });
    }
};

exports.getCartItem = async (req, res) => {
    try {
        const cart = await buildCartResponse(req.user.id);

        if (!cart) {
            return res.status(404).json({ message: "No cart found" });
        }

        res.status(200).json({
            status: "success",
            data: cart,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error,
        });
    }
};
