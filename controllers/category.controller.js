const Category = require("../models/Category");

exports.getAllCategories = async (req, res) => {
	try {
		const category = await Category.find();
		return res.status(200).json(category);
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
