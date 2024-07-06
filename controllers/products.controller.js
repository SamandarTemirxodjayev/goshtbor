const Products = require("../models/Products");
const dotenv = require("dotenv");
const filterByLang = require("../utils/filters");

dotenv.config();

exports.getProducts = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		let products = await Products.find()
			.populate("category")
			.populate("brand")
			.populate("subcategory")
			.skip(skip)
			.limit(perPage);

		const totalItems = await Products.countDocuments();
		const totalPages = Math.ceil(totalItems / perPage);

		products = filterByLang(
			products,
			req.query._l,
			"name",
			"description",
			"category.name",
			"subcategory.name",
		);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/products?page=${page}&perPage=${perPage}`,
			first: `${url}/api/products?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/products?page=${page - 1}&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/products?page=${page + 1}&perPage=${perPage}`
					: null,
			last: `${url}/api/products?page=${totalPages}&perPage=${perPage}`,
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

exports.getNewProducts = async (req, res) => {
	try {
		const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		let products = await Products.find({
			createdAt: {$gte: fiveDaysAgo},
		})
			.skip(skip)
			.limit(perPage)
			.exec();

		let totalItems;

		if (!products.length && page === 1) {
			products = await Products.find({}).sort({createdAt: -1}).limit(10).exec();
			totalItems = await Products.countDocuments({});
		} else {
			totalItems = await Products.countDocuments({
				createdAt: {$gte: fiveDaysAgo},
			});
		}

		const totalPages = Math.ceil(totalItems / perPage);

		products = filterByLang(
			products,
			req.query._l,
			"name",
			"description",
			"category.name",
			"subcategory.name",
		);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/products/new?page=${page}&perPage=${perPage}`,
			first: `${url}/api/products/new?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/products/new?page=${page - 1}&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/products/new?page=${page + 1}&perPage=${perPage}`
					: null,
			last: `${url}/api/products/new?page=${totalPages}&perPage=${perPage}`,
		};

		return res.json({
			message: "New Products fetched successfully!",
			status: 200,
			data: products,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).send(error);
	}
};

exports.getPopularProducts = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		const products = await Products.find({})
			.sort({saleds: -1})
			.skip(skip)
			.limit(perPage)
			.exec();

		const totalItems = await Products.countDocuments({});
		const totalPages = Math.ceil(totalItems / perPage);

		products = filterByLang(
			products,
			req.query._l,
			"name",
			"description",
			"category.name",
			"subcategory.name",
		);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/products/popular?page=${page}&perPage=${perPage}`,
			first: `${url}/api/products/popular?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/products/popular?page=${page - 1}&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/products/popular?page=${page + 1}&perPage=${perPage}`
					: null,
			last: `${url}/api/products/popular?page=${totalPages}&perPage=${perPage}`,
		};

		return res.json({
			message: "Popular Products fetched successfully!",
			status: 200,
			data: products,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).send(error);
	}
};

exports.createProduct = async (req, res) => {
	try {
		const newProduct = await Products.create(req.body);
		return res.status(200).json({
			message: "Product created successfully!",
			data: newProduct,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.deleteProduct = async (req, res) => {
	try {
		const productId = req.params.id;
		const deletedProduct = await Products.findByIdAndDelete(productId);
		return res.status(200).json({
			message: "Product deleted successfully!",
			data: deletedProduct,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.updateProduct = async (req, res) => {
	try {
		const productId = req.params.id;
		const updatedProduct = await Products.findByIdAndUpdate(
			productId,
			req.body,
			{
				new: true,
			},
		);
		return res.status(200).json({
			message: "Product updated successfully!",
			status: 200,
			data: updatedProduct,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.searchProduct = async (req, res) => {
	try {
		const search = {};
		if (req.body.category) {
			search.category = req.body.category;
		}
		if (req.body.brand) {
			search.brand = req.body.brand;
		}
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		const products = await Products.find(search)
			.populate("brand")
			.populate("category")
			.populate("subcategory")
			.skip(skip)
			.limit(perPage);

		const totalItems = await Products.countDocuments(search);
		const totalPages = Math.ceil(totalItems / perPage);

		products = filterByLang(
			products,
			req.query._l,
			"name",
			"description",
			"category.name",
			"subcategory.name",
		);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/products/search?page=${page}&perPage=${perPage}`,
			first: `${url}/api/products/search?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/products/search?page=${page - 1}&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/products/search?page=${page + 1}&perPage=${perPage}`
					: null,
			last: `${url}/api/products/search?page=${totalPages}&perPage=${perPage}`,
		};

		return res.status(200).json({
			message: "Products fetched successfully!",
			status: 200,
			data: products,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.searchProductByName = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.limit, 10) || 10;
		const skip = (page - 1) * perPage;

		let products = await Products.find({
			$or: [
				{name_uz: {$regex: req.body.name, $options: "i"}},
				{name_ru: {$regex: req.body.name, $options: "i"}},
				{name_en: {$regex: req.body.name, $options: "i"}},
			],
		})
			.skip(skip)
			.limit(perPage);

		const totalItems = await Products.countDocuments({
			$or: [
				{name_uz: {$regex: req.body.name, $options: "i"}},
				{name_ru: {$regex: req.body.name, $options: "i"}},
				{name_en: {$regex: req.body.name, $options: "i"}},
			],
		});
		const totalPages = Math.ceil(totalItems / perPage);

		products = filterByLang(
			products,
			req.query._l,
			"name",
			"description",
			"category.name",
			"subcategory.name",
		);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/products/search/bysubcategory?page=${page}&perPage=${perPage}`,
			first: `${url}/api/products/search/bysubcategory?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/products/search/bysubcategory?page=${
							page - 1
					  }&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/products/search/bysubcategory?page=${
							page + 1
					  }&perPage=${perPage}`
					: null,
			last: `${url}/api/products/search/bysubcategory?page=${totalPages}&perPage=${perPage}`,
		};

		return res.json({
			status: "success",
			data: products,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({message: error.message});
	}
};

exports.searchProductBySubCategories = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.limit, 10) || 10;
		const skip = (page - 1) * perPage;

		let products = await Products.find({
			category: req.body.category,
			subcategory: req.body.subcategory,
		})
			.populate("brand")
			.populate("category")
			.populate("subcategory")
			.skip(skip)
			.limit(perPage);

		const totalItems = await Products.countDocuments({
			category: req.body.category,
			subcategory: req.body.subcategory,
		});
		const totalPages = Math.ceil(totalItems / perPage);

		products = filterByLang(
			products,
			req.query._l,
			"name",
			"description",
			"category.name",
			"subcategory.name",
		);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/products/search/bysubcategory?page=${page}&perPage=${perPage}`,
			first: `${url}/api/products/search/bysubcategory?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/products/search/bysubcategory?page=${
							page - 1
					  }&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/products/search/bysubcategory?page=${
							page + 1
					  }&perPage=${perPage}`
					: null,
			last: `${url}/api/products/search/bysubcategory?page=${totalPages}&perPage=${perPage}`,
		};

		return res.json({
			status: "success",
			data: products,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status500().json({message: error.message});
	}
};
