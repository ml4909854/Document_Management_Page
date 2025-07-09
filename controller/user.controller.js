const express = require("express");
const User = require("../model/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/sendEmail");

// register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check if user already register.
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exits. Try differnt email." });
    }

    // hash password.
    const SALTROUND = parseInt(process.env.SALTROUND);
    const hashedPassword = await bcrypt.hash(password, SALTROUND);

    const newUser = new User({ name, email, role, password: hashedPassword });
    const savedUser = await newUser.save();
    res.status(201).json({
      message: `${savedUser.name} reigstered successfully!`,
      user: savedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user!", error: error.message });
  }
});

// login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found!, Please register first" });
    }
    const comaparePassword = await bcrypt.compare(password, user.password);
    if (!comaparePassword) {
      return res.status(400).json({ message: "password incorrect!" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: `${user.name} login successfull`,
      token,
      userId: user._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging user!", error: error.message });
  }
});

// // forgot password route
// router.post("/forgot-password", async (req, res) => {
//   try {
//     const { email, newPassword, confirmPassword } = req.body;

//     // check user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found!" });
//     }

//     if (newPassword.toString() !== confirmPassword.toString()) {
//       return res
//         .status(400)
//         .json({ message: "newPassword and confirmpassword are not match!" });
//     }

//     // hash newPassword
//     const SALTROUND = parseInt(process.env.SALTROUND);
//     const hashedPassword = await bcrypt.hash(newPassword, SALTROUND);

//     // update the user password
//     user.password = hashedPassword;
//     await user.save();
//     res
//       .status(201)
//       .json({ message: "password forgot successfully!", user: user });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "error forgotting password", error: error.message });
//   }
// });

// forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found!" });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: "20m" }
    );

    // now we have to sent the email to the particular url.
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await sendEmail(
      email,
      "Password Reset Link",
      `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    );

    res.status(200).json({ message: "reset link sent to the email!" });
  } catch (error) {
    res.status(500).json({ message: "Error to send the links." });
  }
});

// reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // verify the token
    if (!token) {
      return res.status(400).json({ message: "token missing!" });
    }

    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ message: "user not found!" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "newPassword and confirmpassword are not match" });
    }
     
    const SALTROUND = parseInt(process.env.SALTROUND)
    const hashedPassword = await bcrypt.hash(newPassword , SALTROUND)
     
    user.password = hashedPassword
    await user.save()
    res.status(200).json({message:"Password reset successfully!"})
  } catch (error) {
    res.status(500).json({message:"error to reset password" , error:error.message})
  }
});

module.exports = router;
