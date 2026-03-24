const express = require("express");
const {
    getFoodItem,
    createFoodItem,
    getAllFoodItems,
    deleteFoodItem,
    updateFoodItem,
} = require("../controllers/foodItemController");

const router = express.Router({ mergeParams: true });

router.route("/item").post(createFoodItem);
router.route("/items/:storeId").get(getAllFoodItems);
router
    .route("/item/:foodId")
    .get(getFoodItem)
    .patch(updateFoodItem)
    .delete(deleteFoodItem);

module.exports = router;
