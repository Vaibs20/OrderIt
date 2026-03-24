const express = require("express");
const Restaurant = require("../models/restaurant");

const router = express.Router();

router.get("/count", async (req, res) => {
    try {
        const count = await Restaurant.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({
            error: "Unable to fetch the number of restaurants.",
        });
    }
});

module.exports = router;
