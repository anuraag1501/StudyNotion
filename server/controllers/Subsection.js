const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadFileToCloudinary } = require("../utils/fileUploader");

require("dotenv").config();


exports.createSubsection = async (req, res) => {
    try {
        const { sectionId, title, timeDuration, description } = req.body;

        const video = req.files.videoFile;

        if (!sectionId || !title || !timeDuration || !description) {
            return res.statu(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const uploadDetails = await uploadFileToCloudinary(video, process.env.FOLDER_NAME);

        const SubSectionDetails = await SubSection.create({
            title,
            timeDuration,
            description,
            videoUrl: uploadDetails.secure_url
        });

        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            {
                $push: { subsection: SubSectionDetails._id }
            }
        ).populate("subsection").execute();

        return res.status(200).json({
            success: true,
            message: "Subsection created successfully",
            updatedSection
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error occurred while creating subsection",
            error: error.message
        })
    }
}

exports.updateSubSection = async (req, res) => {

}

exports.deleteSubSection = async (req, res) => {

}