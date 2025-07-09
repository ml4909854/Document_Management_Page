require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db.js");
const userRouter = require("./controller/user.controller.js")
const documentRouter = require("./controller/document.controller.js")
const helmet = require("helmet");
const cors = require("cors");
const app = express();

// Helmet is used for security.
app.use(helmet());
// Connect frontend to backend.
app.use(cors());
// Convert body data to JSON.
app.use(express.json());


// routes --->
// user route
app.use("/user" , userRouter)
// document route
app.use("/document" ,documentRouter)


// Health check route.
app.get("/", (req, res) => {
  res.send("Connected!");
});

// Handle 404 - route not found.
app.use((req, res) => {
  res.status(404).send("404 page not found!");
});

// PORT (e.g., 3000)
const PORT = process.env.PORT || 3000; // ✅ Add default value

app.listen(PORT, async() => {
    await connectDB()
  console.log(`Server is running on port ${PORT}`);
});
