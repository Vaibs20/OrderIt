const Menu = require("../models/menu");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");

exports.getAllMenus = catchAsync(async (req, res) => {
    const query = req.params.storeId ? { restaurant: req.params.storeId } : {};
    const menus = await Menu.find(query).populate({ path: "menu.items", model: "FoodItem" }).exec();

    res.status(200).json({
        status: "success",
        count: menus.length,
        data: menus,
    });
});

exports.createMenu = catchAsync(async (req, res) => {
    const menu = await Menu.create(req.body);

    res.status(201).json({
        status: "success",
        data: menu,
    });
});

exports.deleteMenu = catchAsync(async (req, res, next) => {
    const menu = await Menu.findByIdAndDelete(req.params.menuId);

    if (!menu) {
        return next(new ErrorHandler("No document found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
    });
});
