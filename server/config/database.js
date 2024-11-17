const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    console.log("Connecting to DB...");
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => console.log("DB Connected Successfully"))
        .catch((error) => {
            console.log("DB Connection Failed");
            console.error(error);
            process.exit(1);
        })
}