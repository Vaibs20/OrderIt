const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const errorMiddleware = require("./middlewares/errors");

const foodRouter = require("./routes/foodItem");
const menuRouter = require("./routes/menu");
const restaurantRouter = require("./routes/restaurant");
const orderRouter = require("./routes/order");
const authRouter = require("./routes/auth");
const paymentRouter = require("./routes/payment");
const couponRouter = require("./routes/couponRoutes");
const cartRouter = require("./routes/cart");

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || true,
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "30kb" }));
app.use(cookieParser());
app.use(fileUpload());

app.use("/api/v1/eats/fooditems", foodRouter);
app.use("/api/v1/eats/menus", menuRouter);
app.use("/api/v1/eats/stores", restaurantRouter);
app.use("/api/v1/eats/orders", orderRouter);
app.use("/api/v1/users", authRouter);
app.use("/api/v1", paymentRouter);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/eats/cart", cartRouter);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "view"));

app.all("*", (req, res, next) => {
    res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server !`,
    });
});

app.use(errorMiddleware);

module.exports = app;
