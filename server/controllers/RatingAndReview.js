const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

exports.createRating = async (req, res) => {
    try {
        const userId = req.user.id;

        const { rating, review, courseId } = req.body;

        //Checking if user is enrolled or not
        const courseDetails = await Course.findOne({
            _id: courseId,
            studentsEnrolled: { $elemMatch: { $eq: userId } }
        });

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in the course"
            })
        }

        //Check if user has already rated/reviewed
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        });

        if (alreadyReviewed) {
            res.status(403).json({
                success: false,
                message: "Course is already reviewed by the user"
            })
        }

        const ratingDetails = await RatingAndReview.create({
            rating,
            review,
            course: courseId,
            user: userId
        });

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: { ratingAndReviews: ratingDetails }
            },
            { new: true }
        )

        console.log(updatedCourse);

        return res.status(200).json({
            success: true,
            message: "Rating and review created Succesfully"
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error occurred while creating rating",
            error: error.message
        })
    }
}

exports.getAverateRating = async (req, res) => {
    try {
        const { courseId } = req.body;

        //calculating average rarting
        const result = await RatingAndReview.aggregate([
            { $match: { course: new mongoose.Types.ObjectId(courseId) } },
            //NULL Will group all of them into one
            { $group: { _id: null, averateRating: { $avg: "$rating" } } }
        ]);

        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating
            })
        }

        return res.status(200).json({
            success: true,
            message: "Averate Rating is 0. No rating is found",
            averateRating: 0
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching average rating",
            error: error.message
        })
    }
}

exports.getAllRatingsReviews = async (req, res) => {
    try {
        const allRatingAndReview = await RatingAndReview
            .find({})
            .sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image"
            })
            .populate({
                path:"course",
                select: "courseName"
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: "All ratings and reviews fetched successfully",
            data: allRatingAndReview
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching all rating",
            error: error.message
        })
    }
}