const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter FoodItem name"],
        trim: true,
        maxlength: [100, "FoodItem name cannot exceed 100 characters "],
    },
    price: {
        type: Number,
        required: [true, "Please enter FoodItem price"],
        min: [0, "FoodItem price cannot be negative"],
        default: 0,
    },
    description: {
        type: String,
        required: [true, "Please enter FoodItem description"],
    },
    ratings: {
        type: Number,
        default: 0,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },
    ],
    menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
    },
    stock: {
        type: Number,
        required: [true, "Please enter foodItem stock"],
        min: [0, "FoodItem stock cannot be negative"],
        default: 0,
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            name: { type: String, required: true },
            rating: { type: Number, required: true },
            Comment: { type: String, required: true },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("FoodItem", foodItemSchema);
