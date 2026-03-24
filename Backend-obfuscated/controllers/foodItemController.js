const FoodItem = require("../models/foodItem");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllFoodItems = catchAsync(async (req, res) => {
    const queryObject = {};

    if (req.params.storeId) {
        queryObject.restaurant = req.params.storeId;
    }

    const features = new APIFeatures(FoodItem.find(queryObject), req.query)
        .search()
        .filter()
        .sort();

    const foodItems = await features.query;

    res.status(200).json({
        status: "success",
        results: foodItems.length,
        data: foodItems,
    });
});

exports.getFoodItem = catchAsync(async (req, res, next) => {
    const foodItem = await FoodItem.findById(req.params.foodId);

    if (!foodItem) {
        return next(new ErrorHandler("No foodItem found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: foodItem,
    });
});

exports.createFoodItem = catchAsync(async (req, res) => {
    const foodItem = await FoodItem.create(req.body);

    res.status(201).json({
        status: "success",
        data: foodItem,
    });
});

exports.updateFoodItem = catchAsync(async (req, res, next) => {
    const foodItem = await FoodItem.findByIdAndUpdate(
        req.params.foodId,
        req.body,
        { new: true, runValidators: true }
    );

    if (!foodItem) {
        return next(new ErrorHandler("No FoodItem found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: foodItem,
    });
});

exports.deleteFoodItem = catchAsync(async (req, res, next) => {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.foodId);

    if (!foodItem) {
        return next(new ErrorHandler("No document found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
    });
});
