const express = require("express");
const {
    getAllRestaurants,
    createRestaurant,
    getRestaurant,
    deleteRestaurant,
} = require("../controllers/restaurantController");
const menuRoutes = require("./menu");

const router = express.Router({ mergeParams: true });

router.route("/").get(getAllRestaurants).post(createRestaurant);
router.route("/:storeId").get(getRestaurant).delete(deleteRestaurant);
router.use("/:storeId/menus", menuRoutes);

module.exports = router;
