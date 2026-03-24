const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const app = require("./app");
const connectDatabase = require("./config/database");

connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(
        `Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
    );
});

process.on("uncaughtException", (err) => {
    console.error(`ERROR: ${err.message}`);
    console.error("Shutting down server due to uncaught exception");
    process.exit(1);
});

process.on("unhandledRejection", (err) => {
    console.error(`ERROR: ${err.message}`);
    console.error("Shutting down the server due to Unhandled Promise rejection");
    server.close(() => {
        process.exit(1);
    });
});
