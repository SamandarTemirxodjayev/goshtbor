const PreOrders = require("../models/Preorders");
const {sendSMSUrl} = require("../utils/SMS");

exports.createPreOrderByHelper = async (req, res) => {
	try {
		console.log(req.body);
		const {products, ...otherFields} = req.body;
		const transformedProducts = products.map((product) => ({
			product: product._id,
			quantity: product.quantity,
		}));

		const newPreOrder = await PreOrders.create({
			helperId: req.helperId,
			...otherFields,
			products: transformedProducts,
		});
		await newPreOrder.save();
		await sendSMSUrl(
			newPreOrder.phone_number,
			newPreOrder.name,
			newPreOrder._id,
		);
		return res.json({
			message: "success",
			status: "success",
			data: newPreOrder,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
			data: error,
		});
	}
};
