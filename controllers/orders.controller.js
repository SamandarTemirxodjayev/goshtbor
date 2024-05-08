const Orders = require("../models/Orders");
const {v4: uuidv4} = require("uuid");
const {sendSMS} = require("../utils/SMS");
const {createHash, compare} = require("../utils/codeHash");
const Confirmations = require("../models/Confirmation");
const {getMulticardToken} = require("../utils/authTokenMulticard");
const axios = require("axios");
const https = require("https");

exports.getAllOrders = async (req, res) => {
	try {
		const orders = await Orders.find({
			userId: req.userId._id,
		}).populate("products.product");
		return res.json({
			status: "success",
			data: orders,
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
exports.createOrder = async (req, res) => {
	try {
		if (req.body.pay.type == "card") {
			const newOrder = new Orders({
				userId: req.userId._id,
				delivery: {
					date: req.body.delivery.date,
					address: {
						longitude: req.body.delivery.address.longitude,
						latitude: req.body.delivery.address.latitude,
					},
				},
				pay: {
					type: req.body.pay.type,
				},
				"phone.number": req.body.phone.number,
				products: req.body.products,
				comment: req.body.comment || "",
			});
			await newOrder.save();
			const {token} = await getMulticardToken();
			const agent = new https.Agent({
				rejectUnauthorized: false,
			});
			const response = await axios.post(
				process.env.MULTICARD_CONNECTION_API + "/payment",
				{
					card: {
						pan: req.body.pay.card.pan,
						expiry: req.body.pay.card.expiry,
					},
					amount: 100 * 100,
					store_id: process.env.MULTICARD_STORE_ID,
					invoice_id: newOrder._id,
					details: "",
				},
				{
					httpsAgent: agent,
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			newOrder.pay.card.card_pan = response.data.data.card_pan;
			newOrder.pay.card.uuid = response.data.data.uuid;
			newOrder.pay.card.payment_amount = response.data.data.payment_amount;
			newOrder.pay.card.total_amount = response.data.data.total_amount;
			newOrder.pay.card.commission_amount =
				response.data.data.commission_amount;
			await newOrder.save();

			return res.json({
				success: true,
				data: newOrder,
			});
		}
		const newOrder = new Orders({
			userId: req.userId._id,
			delivery: {
				date: req.body.delivery.date,
				address: {
					longitude: req.body.delivery.address.longitude,
					latitude: req.body.delivery.address.latitude,
				},
			},
			"phone.number": req.body.phone.number,
			products: req.body.products,
			comment: req.body.comment || "",
		});
		await newOrder.save();
		return res.json({
			status: "success",
			data: newOrder,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({error: error});
	}
};
exports.orderConfirmByCard = async (req, res) => {
	try {
		const {uuid} = req.params;
		const {code} = req.body;
		const {token} = await getMulticardToken();
		const agent = new https.Agent({
			rejectUnauthorized: false,
		});

		const response = await axios.put(
			process.env.MULTICARD_CONNECTION_API + "/payment/" + uuid,
			{
				otp: code,
			},
			{
				httpsAgent: agent,
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);
		const order = await Orders.findOne({
			"pay.card.uuid": uuid,
		});

		if (!order || order.status != 0) {
			return res.status(400).json({
				message: "error",
				success: false,
				data: {
					order: "Not Found",
				},
			});
		}
		if (response.data.success) {
			order.status = 1;
			order.pay.status = "payed";
			order.pay.pay_date = new Date().toISOString();
			await order.save();

			return res.status(200).json({
				message: "Payment confirmed",
				status: 200,
				data: {
					order,
					info: response.data,
				},
			});
		} else {
			return res.status(400).json({
				message: "Payment failed",
				status: 400,
				data: {
					order,
					info: response.data,
				},
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "error",
			success: false,
			error: error,
		});
	}
};
exports.confirmationCode = async (req, res) => {
	try {
		const {number} = req.body.phone;

		let confirmationw = await Confirmations.findOne({data: number});

		if (confirmationw) {
			let {expired, confirmation} = await Confirmations.checkAndDeleteExpired(
				confirmationw.uuid,
			);
			if (!expired) {
				return res.status(400).json({
					status: "waiting",
					message: "Confirmation already exists",
					data: {
						id: confirmation._id,
						uuid: confirmation.uuid,
						type: confirmation.type,
						createdAt: confirmation.createdAt,
						expiredAt: confirmation.expiredAt,
					},
				});
			}
		}

		let code = Math.floor(1000 + Math.random() * 9000);
		await sendSMS(number, code);
		const newConfirmation = new Confirmations({
			code: await createHash(code),
			uuid: uuidv4(),
			data: number,
			type: "phone",
			expiredAt: new Date(Date.now() + 1000 * 2 * 60),
		});
		await newConfirmation.save();
		return res.json({success: true, status: "success", data: newConfirmation});
	} catch (error) {
		return res
			.json({
				error,
			})
			.status(500);
	}
};
exports.confirmationCodeUUID = async (req, res) => {
	try {
		const {uuid} = req.params;
		const {code} = req.body;
		const confirmations = await Confirmations.findOne({uuid});
		if (!confirmations) {
			return res.status(404).json({
				status: "error",
				message: "Confirmation not found",
			});
		}
		const {expired, confirmation} = await Confirmations.checkAndDeleteExpired(
			uuid,
		);

		if (expired) {
			return res.status(400).json({
				status: "error",
				message: "Confirmation expired. send new code",
			});
		}

		const isMatch = await compare(code.toString(), confirmation.code);
		if (!isMatch) {
			return res.status(400).json({
				status: "error",
				message: "Invalid code",
			});
		}
		await Confirmations.findOneAndDelete({uuid});

		return res.json({
			success: true,
			status: "success",
			message: "Confirmed",
		});
	} catch (error) {
		return res.status(500).json(error);
	}
};