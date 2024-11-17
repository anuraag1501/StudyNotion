const User = require("../models/User");
const mailSender = require("../utils/mailSender");

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        const email = req.body.email;

        const user = await User.findOne({email: email});

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Your Email is not registered with us'
            })
        }

        const token = crypto.randomUUID();

        const updatedDetaills = await User.findOneAndUpdate(
            {email: email},
            {
                token: token,
                resetPasswordExpires: Date.now() + 5*60*1000
            },
            {new: true}
        );

        const url = `http://localhost:3000/update-password/${token}`;

        await mailSender(
            email,
            "Password Reset Link",
            `Click the link to reset the Password: ${url}`
        );

        return res.status(200).json({
            success: true,
            message: "Reset password mail sent successfully. Please check email to change your password"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong while trying to send reset password to mail"
        })
    }
}

//resetPassword
exports.resetPassword = async(req, res) => {
    try {
        const {password, confirmPassword, token} = req.body;

        if (!password || !confirmPassword || !token) {
            return res.status(403).json({
                success: false,
                message: "All fields are required, please try again"
            })
        }

        if(password !== confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "Passwords do not match"
            })
        }

        const userDetails = await user.findOne({token: token});

        if(!userDetails) {
            return res.status(404).json({
                success: false,
                message: "Invalid token"
            })
        }

        if (userDetails.resetPasswordExpires < Date.now() ) {
            return res.status(400).json({
                success: false,
                message: "Token expired. Please try again"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate(
            {token: token}, 
            {password: hashedPassword},
            {new:true}
        )

        return res.status(200).json({
            success: true,
            message: "Password reset successful" 
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong while trying to reset password"
        })
    }
}