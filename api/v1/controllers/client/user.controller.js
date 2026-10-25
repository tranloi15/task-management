const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const md5 = require("md5");
const generateHelper = require("../../../../helpers/generate.helper");
const sendMailHelper = require("../../../../helpers/sendMail.helper");

// [GET] /api/v1/user/register
module.exports.register = async (req, res) => {
    res.json({
        code: 200,
        message: "Trang đăng ký tài khoản"
    });
};

// [POST] /api/v1/user/register
module.exports.registerPost = async (req, res) => {
    try {
        const existEmail = await User.findOne({
            email: req.body.email,
            deleted: false
        });

        if (existEmail) {
            return res.status(400).json({
                code: 400,
                message: "Email đã tồn tại trong hệ thống!"
            });
        }

        req.body.password = md5(req.body.password);
        req.body.tokenUser = generateHelper.generateRandomString(30);

        const user = new User(req.body);
        await user.save();

        res.status(201).json({
            code: 201,
            message: "Đăng ký tài khoản thành công!",
            userInfo: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Lỗi server!",
            error: error.message
        });
    }
};

// [POST] /api/v1/user/login
module.exports.loginPost = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: email,
            deleted: false
        });

        if (!user) {
            return res.status(400).json({
                code: 400,
                message: "Email không tồn tại trong hệ thống!"
            });
        }

        if (md5(password) !== user.password) {
            return res.status(400).json({
                code: 400,
                message: "Mật khẩu không chính xác!"
            });
        }

        res.status(200).json({
            code: 200,
            message: "Đăng nhập thành công!",
            tokenUser: user.tokenUser,
            userInfo: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Lỗi server!",
            error: error.message
        });
    }
};
// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
    res.json({
        code: 200,
        message: "Giao diện nhập email lấy mã OTP"
    });
};

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
    try {
        const email = req.body.email;


        const existUser = await User.findOne({
            email: email,
            deleted: false
        });

        if (!existUser) {
            return res.status(400).json({
                code: 400,
                message: "Email không tồn tại trong hệ thống!"
            });
        }

        const otp = generateHelper.generateRandomNumber(6);

        const recordForgotPassword = new ForgotPassword({
            email: email,
            otp: otp,
            expireAt: Date.now() + 3 * 60 * 1000
        });
        await recordForgotPassword.save();

        const subject = "Mã OTP xác thực lấy lại mật khẩu";
        const html = `Mã OTP xác thực của bạn là: <b style="color: green; font-size: 20px;">${otp}</b>. Mã có hiệu lực trong vòng 3 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.`;

        sendMailHelper.sendMail(email, subject, html);

        res.status(200).json({
            code: 200,
            message: "Đã gửi mã OTP qua email thành công!",
            email: email
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Lỗi server!",
            error: error.message
        });
    }
};
// [GET] /api/v1/user/password/otp
module.exports.otpPassword = async (req, res) => {
    try {
        const email = req.query.email;
        res.json({
            code: 200,
            message: "Màn hình nhập mã OTP xác thực",
            email: email
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Lỗi server!",
            error: error.message
        });
    }
};

// [POST] /api/v1/user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const existRecord = await ForgotPassword.findOne({
            email: email,
            otp: otp
        });

        if (!existRecord) {
            return res.status(400).json({
                code: 400,
                message: "Mã OTP không chính xác hoặc đã hết hạn!"
            });
        }

        const user = await User.findOne({
            email: email,
            deleted: false
        });

        if (!user) {
            return res.status(400).json({
                code: 400,
                message: "Tài khoản không tồn tại!"
            });
        }

        res.status(200).json({
            code: 200,
            message: "Xác thực mã OTP thành công!",
            tokenUser: user.tokenUser
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Lỗi server!",
            error: error.message
        });
    }
};