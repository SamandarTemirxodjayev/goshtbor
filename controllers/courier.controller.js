const {Types} = require("mongoose");
const Courier = require("../models/Courier");
const Orders = require("../models/Orders");
const {createToken} = require("../utils/token");
const oneSignalClient = require("../utils/oneSignalclient.js");
const Users = require("../models/Users.js");
const {calculateStars} = require("../utils/starsCalc.js");
const {sendMessageByBot} = require("../utils/sendTelegramBotMessage.js");
const {wsOrderCDelivery} = require("../ws/delivery.js");

exports.createCourier = async (req, res) => {
	try {
		const newCourier = await Courier.create({
			name: req.body.name,
			surname: req.body.surname,
			car: {
				number: req.body.car.number,
				model: req.body.car.model,
			},
			phone_number: req.body.phone_number,
			photo_url: req.body.photo_url,
			login: "admin",
			password: "admin",
		});
		await newCourier.save();
		return res.json({
			status: "success",
			message: "created",
			data: newCourier,
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
		});
	}
};
exports.loginCourier = async (req, res) => {
	try {
		const user = await Courier.findOne({
			login: req.body.login,
			password: req.body.password,
		});
		if (!user) {
			return res.status(400).json({
				status: "error",
				message: "Foydalanuvchi topilmadi",
			});
		}
		const token = createToken(user._id);
		return res.json({
			status: 200,
			message: "Confirmed",
			data: {
				auth_token: token,
				token_type: "bearer",
				createdAt: new Date(),
				expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			},
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
		});
	}
};
exports.getMe = async (req, res) => {
	try {
		return res.json({
			status: "success",
			message: "success",
			data: req.courierId,
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
		});
	}
};
exports.editProfile = async (req, res) => {
	try {
		req.courierId.photo_url = req.body.photo_url;
		await req.courierId.save();
		return res.json({
			status: "success",
			message: "success",
			data: req.courierId,
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
		});
	}
};
exports.getAvailableOrders = async (req, res) => {
	try {
		const orders = await Orders.find({
			status: 2,
			"pay.status": "payed",
			"delivery.courier": null,
		})
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
			.populate("collector.collector_id");
		return res.json({
			message: "success",
			status: "success",
			data: orders,
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
		});
	}
};
exports.getReceivedOrders = async (req, res) => {
	try {
		const orders = await Orders.find({
			status: 3,
			"delivery.courier": req.courierId._id,
		})
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
			.populate("collector.collector_id");
		return res.json({
			message: "success",
			status: "success",
			data: orders,
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
		});
	}
};
exports.confirmGettingOrder = async (req, res) => {
	try {
		if (!Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).json({
				message: "not valid Id",
				status: "error",
			});
		}
		const order = await Orders.findById(req.params.id)
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
			.populate("userId");
		if (!order) {
			return res.status(400).json({
				message: "not found order",
				status: "error",
			});
		}
		order.delivery.courier = req.courierId._id;
		order.status = 3;
		await order.save();
		if (order.userId.telegram.id) {
			await sendMessageByBot(
				order.userId.telegram.id,
				"Buyurtmagizni kuryer oldi",
			);
		}
		return res.json({
			message: "confirmed",
			status: "success",
			data: order,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: error.messages,
		});
	}
};
exports.confirmOrderDelivery = async (req, res) => {
	try {
		const order = await Orders.findById(req.params.id).populate("userId");
		if (!order.userId || !order.userId.oneSignalId) {
			return res.status(400).json({
				message: "User not found or OneSignal ID is missing",
				status: "error",
			});
		}
		const text = "Buyurtmangiz Yetib Keldi";
		const notificationPayload = {
			contents: {
				en: text,
				uz: text,
				ru: text,
			},
			headings: {
				en: text,
				uz: text,
				ru: text,
			},
			include_player_ids: [order.userId.oneSignalId],
		};

		oneSignalClient
			.createNotification(notificationPayload)
			.then((response) => console.log(response))
			.catch((e) => console.error(e));
		await sendMessageByBot(
			order.userId.telegram.id,
			"Buyurtmagiz manzilga yetib keldi",
		);
		return res.json({
			message: "success",
			status: "success",
			data: order,
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
		});
	}
};
exports.confirmOrderDeliveryEnd = async (req, res) => {
	try {
		if (!Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).json({
				message: "not found order",
				status: "error",
			});
		}
		const order = await Orders.findById(req.params.id).populate({
			path: "products.product",
			populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
		});
		const user = await Users.findById(order.userId);
		user.stars = calculateStars(
			user.stars,
			req.body.stars ? req.body.stars : 5,
		);
		await user.save();
		if (!order) {
			return res.status(400).json({
				message: "not found order",
				status: "error",
			});
		}
		order.status = 4;
		order.delivery.stars = req.body.stars ? req.body.stars : 5;
		order.delivery.comment = req.body.comment ? req.body.comment : "";
		order.delivery.date.end = Date.now();
		await order.save();
		return res.json({
			message: "order was delivered successfully",
			status: "success",
			data: order,
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
		});
	}
};
exports.getOrderHistory = async (req, res) => {
	try {
		const {page = 1, limit = 10} = req.query;

		const orders = await Orders.find({
			status: 3,
			"delivery.courier": req.courierId._id,
		})
			.sort({_id: -1})
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.exec();

		const count = await Orders.countDocuments({
			status: 3,
			"delivery.courier": req.courierId._id,
		});

		return res.json({
			message: "find orders successfully",
			status: "success",
			data: orders,
			_meta: {
				currentPage: parseInt(page),
				perPage: parseInt(limit),
				totalCount: count,
				pageCount: Math.ceil(count / limit),
			},
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
		});
	}
};

exports.getOrderHistoryById = async (req, res) => {
	try {
		const order = await Orders.findById(req.params.id)
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
			.populate("userId")
			.populate("delivery.courier");
		return res.json({
			message: "find order successfully",
			status: "success",
			data: order,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
		});
	}
};
exports.sendInfoToUserSocket = async (req, res) => {
	try {
		await wsOrderCDelivery(req.body);
		return res.json({
			message: "message sent successfully",
			status: "success",
			data: req.body,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
		});
	}
};
