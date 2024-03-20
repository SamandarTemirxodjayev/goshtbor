const Category = require("../models/Category");

exports.getAllCategories = async (req, res) => {
	try {
		const category = await Category.find();
		return res.status(200).json({
			status: 200,
			message: "Kategoriyalar Muvaffaqiyatli Yuklab Olindi",
			data: category,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.createCategory = async (req, res) => {
	const {name_uz, name_ru, name_en, photo_url} = req.body;
	try {
		if (req.userId.user_level === 0) {
			return res.status(400).json({
				status: "error",
				message: "You are not authorized to perform this action",
			});
		}
		const category = new Category({
			name_uz,
			name_ru,
			name_en,
			photo_url,
		});
		await category.save();
		return res.status(200).json({
			status: 200,
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
			status: 200,
			message: "Kategoriya Muvaffaqiyatli O'chirildi",
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
		const category = await Category.findByIdAndUpdate(
			req.params.id,
			{
				name: req.body.name,
			},
			{
				new: true,
			},
		);
		return res.status(200).json({
			status: 200,
			message: "Kategoriya Muvaffaqiyatli Yangilandi",
			data: category,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
