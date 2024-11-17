const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/fileUploader");
require("dotenv").config();

exports.createCourse = async (req, res) => {
    try {
        const { courseName, courseDescription, whatYouWillLearn, price, category } = req.body;

        const thumbnail = req.files.thumbnailImage;

        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);

        console.log(`Instructor Details: ${instructorDetails}`);

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details not found"
            })
        }

        const categoryDetails = await Category.findById(category);

        if (!category) return res.status(400).json({
            success: false,
            message: "categorys Details not found"
        });

        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url
        });

        //adding course to Instructor
        instructorDetails = await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        );

        //updating category schema
        categoryDetails = await category.findByIdAndUpdate(
            { _id: categoryDetails._id },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Course Created Successfully",
            data: newCourse
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find(
            {},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true
            }
        )
            .populate("instructor")
            .execute();

        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data: allCourses
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Cannot Fetch course data",
            error: error.message
        })
    }
}

exports.getCourseDetails = async (req, res) => {
    try {
        const {courseId} = req.body;

        const courseDetails = await Course
                                    .find({_id: courseId})
                                    .populate(
                                        {
                                            path:"instructor",
                                            populate:{
                                                path:"additionalDetails"
                                            }
                                        }
                                    )
                                    .populate("category")
                                    .populate("ratingAndReviews")
                                    .populate(
                                        {
                                            path: "courseContent",
                                            populate: {
                                                path: "subSection"
                                            }
                                        }
                                    )
                                    .exec();
        
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with Course ID: ${courseId} `
            })
        }

        return res.status(200).json({
            success: true,
            message: "Course Details fetched successfully",
            data: courseDetails
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            messge: "Error occurred while fetching course details",
            error: error.messge
        })
    }
}