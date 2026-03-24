const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/logout").get(authController.logout);
router.route("/me").get(authController.protect, authController.getUserProfile);
router
    .route("/password/update")
    .put(authController.protect, authController.updatePassword);
router
    .route("/me/update")
    .put(authController.protect, authController.updateProfile);
router.route("/forgetPassword").post(authController.forgotPassword);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

module.exports = router;
