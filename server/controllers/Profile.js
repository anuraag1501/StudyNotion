const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
    try {
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
        const id = req.user.id;

        if (!contactNumber || !gender || !id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;

        const profileDetails = await Profile.findById({ id: profileId });

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails = gender;

        await profileDetails.save();

        return res.status(200).json({
            success: true,
            messge: "Profile updated successfully",
            profileDetails
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error occurred while updating profile",
            error: error.message
        });
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const id = req.user.id;

        const userDetails = await User.findById(id);

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
        await User.findByIdAndDelete({ _id: id });

        return res.status(200).json({
            success: false,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error occurred while deleting profile",
            error: error.message
        })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
        const allUserDetails = await User.find({}).populate("additionalDetails").exec();

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            allUserDetails
        })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching all users",
            error: error.message
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {

}

exports.getEnrolledCourses = async (req, res) => {

}