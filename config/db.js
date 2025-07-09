const mongoose = require("mongoose");

const mongoUrl = "mongodb://127.0.0.1:27017/DocumentManagement";

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
