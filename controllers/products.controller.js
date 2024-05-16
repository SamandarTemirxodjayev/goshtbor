const Products = require("../models/Products");

exports.getProducts = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;
		const skip = (page - 1) * limit;

		const products = await Products.find()
			.populate("category")
			.populate("brand")
			.populate("subcategory")
			.skip(skip)
			.limit(limit);

		const totalItems = await Products.countDocuments();
		const totalPages = Math.ceil(totalItems / limit);

		return res.status(200).json({
			message: "Products fetched successfully!",
			data: products,
			pagination: {
				totalItems,
				currentPage: page,
				totalPages,
				limit,
			},
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.getNewProducts = async (req, res) => {
	try {
		const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;
		const skip = (page - 1) * limit;

		let products = await Products.find({
			createdAt: {$gte: fiveDaysAgo},
		})
			.skip(skip)
			.limit(limit)
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

		const totalPages = Math.ceil(totalItems / limit);

		return res.json({
			message: "New Products fetched successfully!",
			status: 200,
			data: products,
			pagination: {
				totalItems,
				currentPage: page,
				totalPages,
				limit,
			},
		});
	} catch (error) {
		return res.status(500).send(error);
	}
};
exports.getPopularProducts = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;
		const skip = (page - 1) * limit;

		const products = await Products.find({})
			.sort({saleds: -1})
			.skip(skip)
			.limit(limit)
			.exec();

		const totalItems = await Products.countDocuments({});
		const totalPages = Math.ceil(totalItems / limit);

		return res.json({
			message: "Popular Products fetched successfully!",
			status: 200,
			data: products,
			pagination: {
				totalItems,
				currentPage: page,
				totalPages,
				limit,
			},
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
		console.log(error);
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
			message: "Mahsulotlar Yuklandi",
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
		const products = await Products.find(search)
			.populate("brand")
			.populate("category")
			.populate("subcategory");
		return res.status(200).json({
			message: "Mahsulotlar Yuklandi",
			status: 200,
			data: products,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.searchProductByName = async (req, res) => {
	try {
		const products = await Products.searchByName(req.body.name);
		return res.json({
			status: "success",
			data: products,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.searchProductBySubCategories = async (req, res) => {
	try {
		const products = await Products.find({
			category: req.body.category,
			subcategory: req.body.subcategory,
		})
			.populate("brand")
			.populate("category")
			.populate("subcategory");
		return res.json({
			status: "success",
			data: products,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
