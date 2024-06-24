const PreOrders = require("../models/Preorders");
const {sendSMSUrl} = require("../utils/SMS");

exports.createPreOrderByHelper = async (req, res) => {
	try {
		const newPreOrder = await PreOrders.create({
			helperId: req.helperId,
			...req.body,
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
