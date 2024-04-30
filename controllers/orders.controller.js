const Orders = require("../models/Orders");

exports.getAllOrders = async (req, res) => {
	try {
		const orders = await Orders.find({
			userId: req.userId._id,
		});
		return res.json({
			status: "success",
			data: orders,
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
