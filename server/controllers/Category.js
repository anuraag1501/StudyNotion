const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const CategoryDetails = await Category.create({
            name: name,
            description: description
        });

        console.log(CategoryDetails);

        return res.status(200).json({
            success: true,
            message: "Category Created Successfully"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error occurred while saving category"
        })
    }
}

exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find(
            {},
            { name: true, description: true }
        )

        res.status(200).json({
            success: false,
            message: "All tags fetched successfully",
            data: allCategories
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error occurred while fetching tag"
        })
    }
}

exports.categoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body;

        const selectedCategory = await Category.findById(categoryId)
            .populate("courses")
            .exec();

        console.log(selectedCategory);

        if (!selectedCategory) {
            console.log("Category not found.")
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        if (selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category"
            });
        }

        const selectedCourses = selectedCategory.courses;

        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        }).populate("courses");

        let differentCourses = [];

        for (const category of categoriesExceptSelected) {
            differentCourses.push(...category.courses);
        }

        const allCategories = await Category.find().populate("courses");
        const allCourses = allCategories.flatMap((category) => category.courses);
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold = a.sold)
            .slice(0, 10);

        return res.status(200).json({
            success: true,
            selectedCourses: selectedCourses,
            differentCourses: differentCourses,
            mostSellingCourses: mostSellingCourses 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error occurred while fetching tag"
        })
    }
}