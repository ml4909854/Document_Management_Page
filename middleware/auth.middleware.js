const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "You are not authenticated Person for this action" });
    }
    const secret_key = process.env.SECRET_KEY;
    const decoded = jwt.verify(token, secret_key);
    req.user = await User.findById(decoded._id);
    console.log(req.user)
    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Invalid or expired token!", error: error.message });
  }
};

module.exports = auth;
