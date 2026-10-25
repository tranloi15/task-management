const User = require("../../models/user.model");
const md5 = require("md5");
const generateHelper = require("../../../../helpers/generate.helper");

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