const Products = require("../models/Products");

exports.getProducts = async (req, res) => {
	try {
		const products = await Products.find()
			.populate("category")
			.populate("brand");
		return res.status(200).json({
			message: "Products fetched successfully!",
			data: products,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
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
		const products = await Products.find(search);
		console.log(products);
		return res.status(200).json({
			message: "Mahsulotlar Yuklandi",
			status: 200,
			data: products,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
