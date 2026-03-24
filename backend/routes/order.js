const express = require("express");
const authController = require("../controllers/authController");
const { newOrder, getSingleOrder, myOrders } = require("../controllers/orderController");

const router = express.Router();

router.route("/new").post(authController.protect, newOrder);
router.route("/me/myOrders").get(authController.protect, myOrders);
router.route("/:id").get(authController.protect, getSingleOrder);

module.exports = router;
