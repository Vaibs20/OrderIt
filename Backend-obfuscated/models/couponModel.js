const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    couponName: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    subTitle: {
        type: String,
        required: true,
    },
    minAmount: {
        type: Number,
        required: true,
    },
    maxDiscount: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    expire: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model("coupon", couponSchema);
