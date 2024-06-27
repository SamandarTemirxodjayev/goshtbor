const Products = require("../models/Products");
const SubCategory = require("../models/SubCategory");
const dotenv = require("dotenv");

dotenv.config();

exports.getAllSubCategories = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const perPage = parseInt(req.query.perPage) || 10;

		const totalCount = await SubCategory.countDocuments();
		const totalPages = Math.ceil(totalCount / perPage);

		const subcategories = await SubCategory.find()
			.populate("category")
			.skip((page - 1) * perPage)
			.limit(perPage);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalCount,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/subcategory?page=${page}&perPage=${perPage}`,
			first: `${url}/api/subcategory?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/subcategory?page=${page - 1}&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/subcategory?page=${page + 1}&perPage=${perPage}`
					: null,
			last: `${url}/api/subcategory?page=${totalPages}&perPage=${perPage}`,
		};

		return res.json({
			status: "success",
			data: subcategories,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.createSubCategory = async (req, res) => {
	try {
		const subcategories = new SubCategory(req.body);
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
			req.body,
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
exports.getSubCategoriesProducts = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		const query = {
			category: req.body.category,
			subcategory: req.body.subcategory,
		};

		const products = await Products.find(query)
			.populate("category")
			.populate("brand")
			.populate("subcategory")
			.skip(skip)
			.limit(perPage);

		const totalItems = await Products.countDocuments(query);
		const totalPages = Math.ceil(totalItems / perPage);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/subcategory/products?page=${page}&perPage=${perPage}`,
			first: `${url}/api/subcategory/products?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/subcategory/products?page=${
							page - 1
					  }&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/subcategory/products?page=${
							page + 1
					  }&perPage=${perPage}`
					: null,
			last: `${url}/api/subcategory/products?page=${totalPages}&perPage=${perPage}`,
		};

		return res.status(200).json({
			message: "Products fetched successfully!",
			data: products,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
