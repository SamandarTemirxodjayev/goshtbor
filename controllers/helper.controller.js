const Helpers = require("../models/Helper");
const Orders = require("../models/Orders");
const {createHash, compare} = require("../utils/codeHash");
const {createToken} = require("../utils/token");

exports.registerHelper = async (req, res) => {
	try {
		let hashedCode = await createHash(req.body.password.toString());
		const helper = await Helpers.create({
			name: req.body.name,
			surname: req.body.surname,
			login: req.body.login,
			password: hashedCode,
		});
		await helper.save();
		return res.json({
			message: "success",
			status: "success",
			data: helper,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
			data: error,
		});
	}
};
exports.loginHelper = async (req, res) => {
	try {
		const helper = await Helpers.findOne({
			login: req.body.login,
		});
		if (!helper) {
			return res.status(400).json({
				message: "Login Xato",
				status: "error",
				data: [],
			});
		}
		const comparePassword = await compare(req.body.password, helper.password);
		if (!comparePassword) {
			return res.status(400).json({
				message: "Parol Xato",
				status: "error",
				data: [],
			});
		}
		const token = createToken(helper._id);
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
exports.getActiveOrders = async (req, res) => {
	try {
		const orders = await Orders.find({
			status: [0, 1, 2, 3],
		})
			.populate("userId")
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
			.populate("collector.collector_id")
			.populate("delivery.courier");
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
exports.getme = async (req, res) => {
	try {
		return res.json({
			message: "success",
			status: "success",
			data: req.helperId,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
			data: error,
		});
	}
};
exports.editProfile = async (req, res) => {
	try {
		req.helperId.name = req.body.name;
		req.helperId.surname = req.body.surname;
		req.helperId.login = req.body.login;
		if (req.body.password) {
			let hashedCode = await createHash(req.body.password.toString());
			req.helperId.password = hashedCode;
		}
		await req.helperId.save();
		return res.json({
			message: "success",
			status: "success",
			data: req.helperId,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
			data: error,
		});
	}
};
exports.cancelOrder = async (req, res) => {
	try {
		const order = await Orders.findById(req.params.id);
		if (order.status == 0) {
			order.status = -9;
		} else if (order.status == 1) {
			order.status = -1;
		} else if (order.status == 2) {
			order.status = -2;
		} else if (order.status == 3) {
			order.status = -3;
		}
		order.cancel.reason = req.body.reason;
		order.cancel.date = new Date();
		await order.save();
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
exports.searchOrderByIdOrByPhone = async (req, res) => {
	try {
		const orders = await Orders.aggregate([
			{
				$match: {
					$or: [{order_id: req.body.data}, {"phone.number": req.body.data}],
				},
			},
		]);
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
