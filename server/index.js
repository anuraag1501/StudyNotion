require("dotenv").config();

const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 4000;

//Connect to DB
database.connect();

//Add middlewares
app.use(express.json());
app.use(cookieParser());
//Handling CORS
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true
    })
);

//Cloudinary Connect
cloudinaryConnect();

//Add routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

//Default Route
app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Server is up and running"
    });
});

app.listen(PORT, '0.0.0.0',() => {
    console.log(`Server is running at PORT:${PORT}`);
});