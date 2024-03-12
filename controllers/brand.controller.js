const Brand = require("../models/Brands");

exports.createBrand = async (req, res) => {
	try {
		const brand = new Brand({
			photo_url: req.body.photo_url,
			name: req.body.name,
		});
		await brand.save();
		return res.status(200).json({
			message: "Brand created successfully!",
			data: brand,
		});
	} catch (error) {
		console.error("Error creating brand:", error);
		return res.status(500).json({message: error.message});
	}
};

exports.deleteBrand = async (req, res) => {
	try {
		const brand = await Brand.findByIdAndDelete(req.params.id);
		return res.status(200).json({
			message: "Brand deleted successfully!",
			data: brand,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.getBrands = async (req, res) => {
	try {
		const brands = await Brand.find();
		return res.status(200).json({
			message: "Brands fetched successfully!",
			data: brands,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.updateBrand = async (req, res) => {
	try {
		const brand = await Brand.findByIdAndUpdate(
			req.params.id,
			{
				photo_url: req.body.photo_url,
				name: req.body.name,
			},
			{
				new: true,
			},
		);
		return res.status(200).json({
			message: "Brand updated successfully!",
			data: brand,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
