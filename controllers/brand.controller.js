const Brand = require("../models/Brands");
require("dotenv").config();

exports.createBrand = async (req, res) => {
	const {photo_url, name} = req.body;
	if (!photo_url)
		return res.status(400).json({message: "Photo url is required"});
	if (!name) return res.status(400).json({message: "Name is required"});
	try {
		const brand = new Brand({
			photo_url,
			name,
		});
		await brand.save();
		return res.status(200).json({
			message: "Brend Yaratildi",
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
		if (brand) {
			return res.status(200).json({
				message: "Brend o'chirildi",
				status: 200,
				data: brand,
			});
		} else {
			return res.status(404).json({message: "Brend Topilmadi", status: 404});
		}
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.getBrands = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const perPage = parseInt(req.query.perPage) || 10;

		const totalCount = await Brand.countDocuments();
		const totalPages = Math.ceil(totalCount / perPage);

		const brands = await Brand.find()
			.skip((page - 1) * perPage)
			.limit(perPage);

		const url = process.env.URL || "http://localhost:3000";
		return res.status(200).json({
			message: "Brands fetched successfully!",
			data: brands,
			_meta: {
				currentPage: page,
				perPage: perPage,
				totalCount: totalCount,
				totalPages: totalPages,
			},
			_links: {
				self: `${url}/api/brands?page=${page}&perPage=${perPage}`,
				first: `${url}/api/brands?page=1&perPage=${perPage}`,
				prev:
					page > 1
						? `${url}/api/brands?page=${page - 1}&perPage=${perPage}`
						: null,
				next:
					page < totalPages
						? `${url}/api/brands?page=${page + 1}&perPage=${perPage}`
						: null,
				last: `${url}/api/brands?page=${totalPages}&perPage=${perPage}`,
			},
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
			message: "Brend Yangilandi",
			data: brand,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
