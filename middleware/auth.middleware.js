

const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided. Unauthorized access." });
    }

    const secret_key = process.env.SECRET_KEY;
    const decoded = jwt.verify(token, secret_key);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: "User not found. Please log in again." });
    }

    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Invalid or expired token!", error: error.message });
  }
};
module.exports = auth