const Profile = require("../models/Profile");
const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require('otp-generator');
require("dotenv").config();

//sendOTP
exports.sendOTP = async (req, res) => {
    try {
        //fetch email from request body
        const { email } = req.body;

        //check if USER already exists
        const checkUserPresent = await User.findOne({ email });

        //if USER already exists
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: 'User already registered'
            })
        }

        //Generate OTP and check if it already exists in DB
        //NOT A GOOD DESIGN HERE.....(LOOPING DB CALL)
        var otpFound = null;
        var otp = null;

        do {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            })

            otpFound = OTP.findOne({ otp: otp });
        } while (otpFound);

        console.log(`OTP Generated: ${otp}`);

        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);

        return res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            otp,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//signup
exports.signUp = async (req, res) => {
    try {

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        if (!firstName || !lastName || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }

        //Compare Password
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match, please try again"
            });
        }

        //Check if User already exist
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered"
            })
        }

        //Find most recent OTP stored for the email
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);

        //If otp not found
        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            })
        } else if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "OTP does not match. Please try again with the latest OTP"
            })
        }

        //Hasing Password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Create User entry in DB
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: contactNumber
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        return res.status(200).json({
            success: true,
            message: "User is registered successfully",
            user,
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again"
        })
    }
}

//login
exports.login = async (req, res) => {
    try {
        //Fetching Params from req body
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required, please try again"
            })
        }

        //Check if user exist or not
        const user = await User.findOne({ email }).toObject();

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email is not registered"
            })
        }

        //Check Password
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2d" });

            user.token = token;
            user.password = undefined;


            //Adding Token in Cookie
            const options = {
                expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            return res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in successfully"
            })
        } else {
            return res.status(401).json({
                success: false,
                message: "Password is incorect"
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to login. Please try again"
        })
    }
}

//ChangePassword 
exports.changePassword = async (req, res) => {
    try {
        console.log("")
    } catch (error) {
        console.log("")
    }
}