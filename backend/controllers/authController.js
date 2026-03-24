const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const Email = require("../utils/email");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: `${process.env.JWT_EXPIRES_TIME}d`,
    });
};

const sendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    res.cookie("jwt", token, cookieOptions);
    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        token,
        data: { user },
    });
};

const uploadAvatar = async (avatar) => {
    if (!avatar || avatar === "/images/images.png") {
        return {
            public_id: "default_avatar",
            url: "/images/images.png",
        };
    }

    const result = await cloudinary.uploader.upload(avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    });

    return {
        public_id: result.public_id,
        url: result.secure_url,
    };
};

exports.signup = catchAsyncErrors(async (req, res) => {
    const {
        name,
        email,
        password,
        passwordConfirm,
        phoneNumber,
        avatar,
    } = req.body;

    const avatarData = await uploadAvatar(avatar);

    const user = await User.create({
        name,
        email,
        password,
        passwordConfirm,
        phoneNumber,
        avatar: avatarData,
    });

    sendToken(user, 200, res);
});

exports.login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter email & password", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const isPasswordCorrect = await user.correctPassword(password, user.password);
    if (!isPasswordCorrect) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    sendToken(user, 200, res);
});

exports.protect = catchAsyncErrors(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new ErrorHandler("You are not logged in! Please log in to get access.", 401)
        );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(new ErrorHandler("The user belonging to this token does no longer exist.", 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new ErrorHandler(
                "User recently changed password ! please log in again.",
                401
            )
        );
    }

    req.user = currentUser;
    next();
});

exports.getUserProfile = catchAsyncErrors(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const { oldPassword, newPassword, newPasswordConfirm } = req.body;

    const user = await User.findById(req.user.id).select("+password");
    const isOldPasswordCorrect = await user.correctPassword(
        oldPassword,
        user.password
    );

    if (!isOldPasswordCorrect) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const userData = {
        name: req.body.name,
        email: req.body.email,
    };

    if (req.body.avatar !== undefined && req.body.avatar !== "") {
        const currentUser = await User.findById(req.user.id);

        if (
            currentUser.avatar &&
            currentUser.avatar.public_id &&
            currentUser.avatar.public_id !== "default_avatar"
        ) {
            try {
                await cloudinary.uploader.destroy(currentUser.avatar.public_id);
            } catch (error) {
                // Ignore cleanup failures and continue with the new upload.
            }
        }

        const avatarData = await cloudinary.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        userData.avatar = {
            public_id: avatarData.public_id,
            url: avatarData.secure_url,
        };
    }

    await User.findByIdAndUpdate(req.user.id, userData, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
    });
});

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(
            new ErrorHandler("There is no user with email address .", 404)
        );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
        const resetUrl = `${process.env.FRONTEND_URL}/users/resetPassword/${resetToken}`;

        await new Email(user, resetUrl).sendPasswordReset();

        res.status(200).json({
            success: true,
            message: "Token sent to email!",
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new ErrorHandler(
                "There was an error sending the email, try again later!",
                500
            )
        );
    }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Token is invalid or has expired", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendToken(user, 200, res);
});

exports.logout = catchAsyncErrors(async (req, res) => {
    res.cookie("jwt", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged out",
    });
});
