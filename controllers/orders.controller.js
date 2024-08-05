const Orders = require("../models/Orders");
const {v4: uuidv4} = require("uuid");
const {sendSMS} = require("../utils/SMS");
const {createHash, compare} = require("../utils/codeHash");
const Confirmations = require("../models/Confirmation");
const {getMulticardToken} = require("../utils/authTokenMulticard");
const axios = require("axios");
const https = require("https");
const Products = require("../models/Products");
const {wsSendMessage} = require("../ws/server");

exports.getAllOrders = async (req, res) => {
	try {
		const orders = await Orders.find({
			userId: req.userId._id,
		})
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
			.populate("delivery.courier")
			.populate("collector.collector_id");
		return res.json({
			status: "success",
			data: orders,
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
exports.getOrderById = async (req, res) => {
	try {
		let order = await Orders.findOne({
			userId: req.userId._id,
			_id: req.params.id,
		}).populate({
			path: "products.product",
			populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
		});
		if (!order) return res.status(404).json({status: "not found"});
		return res.json({
			status: "success",
			data: order,
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
exports.createOrder = async (req, res) => {
	try {
		const newOrder = new Orders({
			userId: req.userId._id,
			delivery: {
				date: req.body.delivery.date,
				address: {
					longitude: req.body.delivery.address.longitude,
					latitude: req.body.delivery.address.latitude,
					name: req.body.delivery.address.name,
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
		if (req.body.pay.type == "card") {
			let totalAmount = 0;
			for (const product of newOrder.products) {
				const productDoc = await Products.findById(product.product);
				const price = productDoc.sale.isSale
					? productDoc.sale.price
					: productDoc.price;
				const subtotal = price * product.quantity;
				totalAmount += subtotal;
				product.price = price;
			}
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
					amount: totalAmount * 100,
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
		if (req.body.pay.type == "uzum") {
			newOrder.pay.order_url =
				"https://www.apelsin.uz/open-service?serviceId=498616071&order_id=" +
				newOrder.order_id;
			let totalAmount = 0;
			for (const product of newOrder.products) {
				const productDoc = await Products.findById(product.product);
				const price = productDoc.sale.isSale
					? productDoc.sale.price
					: productDoc.price;
				const subtotal = price * product.quantity;
				totalAmount += subtotal;
				product.price = price;
			}
		}
		if (req.body.pay.type == "payme") {
			let totalAmount = 0;
			for (const product of newOrder.products) {
				const productDoc = await Products.findById(product.product);
				if (!productDoc) {
					return res.json({error: "Product not found"});
				}
				const price = productDoc.sale.isSale
					? productDoc.sale.price
					: productDoc.price;
				const subtotal = price * product.quantity;
				totalAmount += subtotal;
				product.price = price;
			}
			const stringToEncode = `m=663b1ac0fe41a3907df8f595;ac.order_id=${
				newOrder.order_id
			};a=${totalAmount * 100}`;

			const base64EncodedString =
				Buffer.from(stringToEncode).toString("base64");
			newOrder.pay.order_url =
				"https://checkout.paycom.uz/" + base64EncodedString;
		}
		if (req.body.pay.type == "click") {
			let totalAmount = 0;
			for (const product of newOrder.products) {
				const productDoc = await Products.findById(product.product);
				if (!productDoc) {
					return res.json({error: "Product not found"});
				}
				const price = productDoc.sale.isSale
					? productDoc.sale.price
					: productDoc.price;
				const subtotal = price * product.quantity;
				totalAmount += subtotal;
				product.price = price;
			}
			newOrder.pay.order_url = `https://my.click.uz/services/pay?service_id=33923&merchant_id=25959&amount=${totalAmount}&transaction_param=${newOrder.order_id}`;
		}
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
		})
			.populate("userId")
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
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
		let totalAmount = 0;
		for (const product of order.products) {
			const productDoc = await Products.findById(product.product);
			const price = productDoc.sale.isSale
				? productDoc.sale.price
				: productDoc.price;
			const subtotal = price * product.quantity;
			totalAmount += subtotal;
			productDoc.quantity -= product.quantity;
			productDoc.saleds += product.quantity;
			if (productDoc.quantity <= 0) {
				productDoc.stock = false;
			}
			await productDoc.save();
		}
		if (response.data.success) {
			order.status = 1;
			order.pay.status = "payed";
			order.pay.pay_date = new Date().toISOString();
			wsSendMessage(order);
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
exports.cancelOrderById = async (req, res) => {
	try {
		let order = await Orders.findOne({
			userId: req.userId._id,
			_id: req.params.id,
		}).populate({
			path: "products.product",
			populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
		});
		if (order.status == 0) {
			order.status = -9;
		} else if (order.status == 1) {
			order.status = -1;
		} else if (order.status == 2) {
			order.status = -2;
		} else if (order.status == 3) {
			order.status = -3;
		}
		order.cancel.reason = "Cancel By User";
		order.cancel.date = new Date();
		await order.save();
		return res.json({
			message: "success",
			status: "success",
			data: order,
		});
	} catch (error) {
		return res.status(500).json(error);
	}
};
