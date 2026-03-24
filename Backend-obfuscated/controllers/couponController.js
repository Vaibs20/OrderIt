const Coupon = require("../models/couponModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");

exports.createCoupon = catchAsync(async (req, res) => {
    const coupon = await Coupon.create(req.body);

    res.status(201).json({
        status: "success",
        data: coupon,
    });
});

exports.getCoupon = catchAsync(async (req, res) => {
    const coupons = await Coupon.find();

    res.status(200).json({
        status: "success",
        data: coupons,
    });
});

exports.updateCoupon = catchAsync(async (req, res, next) => {
    const coupon = await Coupon.findByIdAndUpdate(req.params.couponId, req.body, {
        new: true,
        runValidators: true,
    });

    if (!coupon) {
        return next(new ErrorHandler("No Coupon found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: coupon,
    });
});

exports.deleteCoupon = catchAsync(async (req, res, next) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.couponId);

    if (!coupon) {
        return next(new ErrorHandler("No coupon found with given Id", 404));
    }

    res.status(204).json({
        status: "success",
    });
});

exports.couponValidate = catchAsync(async (req, res, next) => {
    const { couponCode, cartItemsTotalAmount } = req.body;

    if (!couponCode) {
        return next(new ErrorHandler("Invalid coupon code.", 400));
    }

    const coupon = await Coupon.findOne({ couponName: couponCode.toUpperCase() });

    if (!coupon || coupon.expire < new Date()) {
        return next(new ErrorHandler("Invalid coupon code.", 400));
    }

    const totalAmount = Number(cartItemsTotalAmount || 0);

    if (totalAmount < coupon.minAmount) {
        const remaining = coupon.minAmount - totalAmount;
        return res.status(200).json({
            status: "success",
            data: {
                valid: false,
                message: `add ₹ ${remaining} more to avail this offer`,
            },
        });
    }

    const discountAmount = Math.min(
        (totalAmount * coupon.discount) / 100,
        coupon.maxDiscount || Infinity
    );
    const finalTotal = totalAmount - discountAmount;

    res.status(200).json({
        status: "success",
        data: {
            valid: true,
            couponName: coupon.couponName,
            subTitle: coupon.subTitle,
            details: coupon.details,
            minAmount: coupon.minAmount,
            discount: coupon.discount,
            maxDiscount: coupon.maxDiscount,
            discountAmount,
            finalTotal,
            message: "",
        },
    });
});
