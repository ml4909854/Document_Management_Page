const mongoose = require("mongoose");

const mongoUrl = process.env.MONGO_URL

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("db connected successfully!");
  } catch (error) {
    console.error("db error!", error);
    process.exit(1);
  }
};

module.exports = connectDB;
