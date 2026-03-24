const express = require("express");
const authController = require("../controllers/authController");
const {
    addItemToCart,
    updateCartItemQuantity,
    deleteCartItem,
    getCartItem,
} = require("../controllers/cartController");

const router = express.Router();

router.use(authController.protect);
router.route("/add-to-cart").post(addItemToCart);
router.route("/update-cart-item").post(updateCartItemQuantity);
router.route("/delete-cart-item").delete(deleteCartItem);
router.route("/get-cart").get(getCartItem);

module.exports = router;
