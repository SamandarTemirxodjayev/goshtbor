const Category = require("../models/Category");
const filterByLang = require("../utils/filters");
require("dotenv").config();
exports.getAllCategories = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const perPage = parseInt(req.query.perPage) || 10;

		const totalCount = await Category.countDocuments();
		const totalPages = Math.ceil(totalCount / perPage);

		let categories = await Category.find()
			.skip((page - 1) * perPage)
			.limit(perPage)
			.sort({_id: -1});

		categories = filterByLang(categories, req.query._l, "name");

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalCount,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/category?page=${page}&perPage=${perPage}`,
			first: `${url}/api/category?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/category?page=${page - 1}&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/category?page=${page + 1}&perPage=${perPage}`
					: null,
			last: `${url}/api/category?page=${totalPages}&perPage=${perPage}`,
		};

		// Send the response with pagination info
		return res.status(200).json({
			status: 200,
			message: "Kategoriyalar Muvaffaqiyatli Yuklab Olindi",
			data: categories,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.createCategory = async (req, res) => {
	const {name_uz, name_ru, name_en, light_photo_url, dark_photo_url} = req.body;
	try {
		const category = new Category({
			name_uz,
			name_ru,
			name_en,
			light_photo_url,
			dark_photo_url,
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
		const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		return res.status(200).json({
			status: 200,
			message: "Kategoriya Muvaffaqiyatli Yangilandi",
			data: category,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
