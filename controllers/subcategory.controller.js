const SubCategory = require("../models/SubCategory");

exports.getAllSubCategories = async (req, res) => {
	try {
		const subcategories = await SubCategory.find();
		return res.json({
			status: "success",
			data: subcategories,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.createSubCategory = async (req, res) => {
	try {
		const subcategories = await SubCategory.create(req.body);
		await subcategories.save();
		return res.json({status: "success", data: subcategories});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.deleteSubCategory = async (req, res) => {
	try {
		await SubCategory.findByIdAndDelete(req.params.id);
		return res.json({status: "success"});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.updateSubCategory = async (req, res) => {
	try {
		const category = await SubCategory.findByIdAndUpdate(
			req.params.id,
			{
				name_uz: req.body.name_uz,
				name_ru: req.body.name_ru,
				name_en: req.body.name_en,
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
