const Category = require("../models/Category");

exports.getAllCategories = async (req, res) => {
	try {
		const category = await Category.find();
		return res.status(200).json({
			status: "success",
			message: "Categories fetched successfully",
			data: category,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.createCategory = async (req, res) => {
	try {
		if (req.userId.user_level === 0) {
			return res.status(400).json({
				status: "error",
				message: "You are not authorized to perform this action",
			});
		}
		const category = new Category(req.body);
		await category.save();
		return res.status(200).json({
			status: "success",
			message: "Category created successfully",
			data: category,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.deleteCategory = async (req, res) => {
	try {
		if (req.userId.user_level === 0) {
			return res.status(400).json({
				status: "error",
				message: "You are not authorized to perform this action",
			});
		}
		const category = await Category.findByIdAndDelete(req.params.id);
		return res.status(200).json({
			status: "success",
			message: "Category deleted successfully",
			data: category,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.updateCategory = async (req, res) => {
	try {
		if (req.userId.user_level === 0) {
			return res.status(400).json({
				status: "error",
				message: "You are not authorized to perform this action",
			});
		}
		const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		return res.status(200).json({
			status: "success",
			message: "Category updated successfully",
			data: category,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
