const express = require("express");
const router = express.Router();

const {
    createCourse,
    getAllCourses,
    getCourseDetails
} = require("../controllers/Course");

const {
    showAllCategories,
    createCategory,
    categoryPageDetails
} = require("../controllers/Category");

const {
    createSection,
    updateSection,
    deleteSection
} = require("../controllers/Section");

const {
    createSubsection,
    updateSubSection,
    deleteSubSection
} = require("../controllers/Subsection");

const {
    createRating,
    getAverateRating,
    getAllRatingsReviews
} = require("../controllers/RatingAndReview");

const {
    auth,
    isInstructor,
    isStudent,
    isAdmin
} = require("../middlewares/auth");



router.post("/createCourse", auth, isInstructor, createCourse);
router.post("/getCourseDetails", getCourseDetails);
router.get("/getAllCourses", getAllCourses);

router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.post("/deleteSection", auth, isInstructor, deleteSection);

router.post("/addSubSection", auth, isInstructor, createSubsection);
router.post("updateSubSection", auth, isInstructor, updateSubSection);
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

router.post("/createCategory", auth, isAdmin, createCategory);
router.post("/categoryPageDetails", categoryPageDetails);
router.get("/showAllCategories", showAllCategories);

router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverateRating);
router.get("/getReviews", getAllRatingsReviews);

module.exports = router;