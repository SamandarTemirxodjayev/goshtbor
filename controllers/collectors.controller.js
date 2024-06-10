const Collectors = require("../models/Collectors");
const Orders = require("../models/Orders");
const {createToken} = require("../utils/token");

exports.createCollector = async (req, res) => {
	try {
		const collector = await Collectors.create({
			name: req.body.name,
			surname: req.body.surname,
			login: req.body.login,
			password: req.body.password,
		});
		await collector.save();
		return res.json({
			message: "success",
			status: "success",
			data: collector,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
			data: error,
		});
	}
};
exports.loginCollector = async (req, res) => {
	try {
		const collector = await Collectors.findOne({
			login: req.body.login,
		});
		if (!collector) {
			return res.status(400).json({
				message: "Login Xato",
				status: "error",
				data: [],
			});
		}
		if (collector.password != req.body.password) {
			return res.status(400).json({
				message: "Parol Xato",
				status: "error",
				data: [],
			});
		}
		const token = createToken(collector._id);
		return res.json({
			message: "Confirmed",
			status: "success",
			data: {
				auth_token: token,
				token_type: "bearer",
				createdAt: new Date(),
				expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			},
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
			data: error,
		});
	}
};
exports.getAvailableOrders = async (req, res) => {
	try {
		const orders = await Orders.find({
			status: 1,
			"pay.status": "payed",
			"delivery.courier": null,
		})
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
			.populate("userId")
			.sort({
				_id: -1,
			});
		return res.json({
			message: "success",
			status: "success",
			data: orders,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
			data: error,
		});
	}
};
exports.submitOrderById = async (req, res) => {
	try {
		const order = await Orders.findById(req.params.id);
		order.status = 2;
		order.collector.finish_time = new Date();
		order.collector.collector_id = req.collectorId._id;
		order.save();
		return res.json({
			message: "success",
			status: "success",
			data: order,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
			data: error,
		});
	}
};
