const User = require("../../models/user.model");

module.exports.requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const tokenUser = authHeader ? authHeader.split(" ")[1] : req.query.tokenUser || req.body.tokenUser;

        if (!tokenUser) {
            return res.status(401).json({
                code: 401,
                message: "Vui lòng cung cấp token xác thực (Unauthorized)!"
            });
        }

        const user = await User.findOne({
            tokenUser: tokenUser,
            deleted: false
        }).select("-password");

        if (!user) {
            return res.status(401).json({
                code: 401,
                message: "Token không hợp lệ hoặc tài khoản không tồn tại!"
            });
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Lỗi server trong middleware xác thực!",
            error: error.message
        });
    }
};