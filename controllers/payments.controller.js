const {JSONRPCServer} = require("json-rpc-2.0");
const RpcError = require("json-rpc-error");
const Orders = require("../models/Orders");
const Products = require("../models/Products");
const server = new JSONRPCServer();
const fs = require("fs");
const {Types} = require("mongoose");

let error_message = "";

server.addMethod("CheckPerformTransaction", async (params) => {
	let orderId;
	try {
		orderId = new Types.ObjectId(params.account.order_id);
	} catch (error) {
		error_message = "Buyurtma Topilmadi";
		throw new RpcError(-31060, "Invalid order ID format");
	}

	let order = await Orders.findById(orderId);
	if (!order) {
		error_message = "Buyurtma Topilmadi";
		throw new RpcError(-31061, "Order not found");
	}

	let totalAmount = 0;
	let receiptItems = [];

	for (const product of order.products) {
		const productDoc = await Products.findById(product.product);
		if (!productDoc) {
			error_message = "Mahsulot Topilmadi";
			throw new RpcError(-31062, "Product not found in order");
		}

		const price = productDoc.sale.isSale
			? productDoc.sale.price
			: productDoc.price;
		const subtotal = price * product.quantity;
		totalAmount += subtotal;

		receiptItems.push({
			title: productDoc.name_uz,
			price: productDoc.sale.isSale ? productDoc.sale.price : productDoc.price,
			count: product.quantity,
			code: productDoc.MXIK.code,
			package_code: productDoc.MXIK.package_code,
			vat_percent: 0,
		});
	}

	if (totalAmount * 100 !== params.amount) {
		error_message =
			"Buyurtma Summasida Xatolik. Buyurtmani To'liq summasini kiriting";
		throw new RpcError(-31001, "Incorrect total amount");
	}

	return {
		allow: true,
		detail: {
			receipt_type: 0,
			items: receiptItems,
		},
	};
});

server.addMethod("GetStatement", async (params) => {
	const orders = await Orders.find({
		"pay.payme.create_time": {
			$gte: params.from,
			$lte: params.to,
		},
	});
	return {
		transactions: orders,
	};
});
server.addMethod("CancelTransaction", async (params) => {
	const order = await Orders.findOne({
		"pay.payme.id": params.id,
	});
	if (!order) {
		error_message = "Buyurtma Topilmadi";
		throw new RpcError(-32504, "Order not found");
	}
	if (order.pay.payme.cancel_time == 0) {
		order.pay.payme.cancel_time = +new Date();
		if (order.pay.payme.state == 2) order.pay.payme.state = -2;
		if (order.pay.payme.state == 1) order.pay.payme.state = -1;
		order.pay.status = "canceled";
		order.pay.payme.reason = params.reason;
		await order.save();
	}

	return {
		transaction: order._id,
		cancel_time: order.pay.payme.cancel_time,
		state: order.pay.payme.state,
	};
});
server.addMethod("PerformTransaction", async (params) => {
	const order = await Orders.findOne({
		"pay.payme.id": params.id,
	});
	if (!order) {
		error_message = "Buyurtma Topilmadi";
		throw new RpcError(-32504, "Order not found");
	}
	if (order.pay.payme.perform_time == 0) {
		order.pay.payme.state = 2;
		order.pay.payme.perform_time = +new Date();
		order.status = 1;
		order.pay.status = "payed";
		order.pay.pay_date = new Date().toISOString();

		await order.save();
	}

	return {
		transaction: order._id,
		perform_time: order.pay.payme.perform_time,
		state: order.pay.payme.state,
	};
});

server.addMethod("CreateTransaction", async (params) => {
	let orderId;
	try {
		orderId = new Types.ObjectId(params.account.order_id);
	} catch (error) {
		error_message = "Buyurtma Topilmadi";
		throw new RpcError(-31060, "Invalid order ID format");
	}
	const order = await Orders.findById(orderId);
	if (!order) {
		error_message = "Buyurtma Topilmadi";
		throw new RpcError(-31060, "Order not found");
	}
	if (order.pay.payme.id && order.pay.payme.id != params.id) {
		error_message = "Buyurtma Topilmadi";
		throw new RpcError(-31060, "Incorrect order ID");
	}

	let totalAmount = 0;
	for (const product of order.products) {
		const productDoc = await Products.findById(product.product);
		if (!productDoc) {
			error_message = "Mahsulot Topilmadi";
			throw new RpcError(-31060, "Product not found in order");
		}

		const price = productDoc.sale.isSale
			? productDoc.sale.price
			: productDoc.price;
		const subtotal = price * product.quantity;
		totalAmount += subtotal;
	}
	if (totalAmount * 100 !== params.amount) {
		error_message =
			"Buyurtma Summasida Xatolik. Buyurtmani To'liq summasini kiriting";
		throw new RpcError(-31001, "Incorrect total amount");
	}

	order.pay.payme.create_time = params.time;
	order.pay.payme.id = params.id;
	order.pay.payme.amount = params.amount;

	await order.save();

	return {
		create_time: params.time,
		transaction: order._id,
		state: order.pay.payme.state,
	};
});

server.addMethod("CheckTransaction", async (params) => {
	const order = await Orders.findOne({
		"pay.payme.id": params.id,
	});
	if (!order) {
		error_message = "Buyurtma Topilmadi";
		throw new RpcError(-32504, "Transaction not found");
	}
	return {
		create_time: order.pay.payme.create_time,
		perform_time: order.pay.payme.perform_time,
		cancel_time: order.pay.payme.cancel_time,
		transaction: order._id,
		state: order.pay.payme.state,
		reason: order.pay.payme.reason,
	};
});

exports.paymeHandler = async (req, res) => {
	const authorizationHeader = req.headers.authorization;
	if (!authorizationHeader) {
		return res.json({
			jsonrpc: "2.0",
			id: req.body.id,
			error: {
				code: -32504,
				message: "Not Authorized! Invalid credentials 1",
			},
		});
	}

	const accessToken = authorizationHeader.split(" ")[1];
	if (!accessToken) {
		return res.json({
			jsonrpc: "2.0",
			id: req.body.id,
			error: {
				code: -32504,
				message: "Not Authorized! Invalid credentials 2",
			},
		});
	}

	try {
		fs.readFile("./db/payme.json", "utf8", async (err, data) => {
			if (err) {
				return res.json({
					jsonrpc: "2.0",
					id: req.body.id,
					error: {
						code: -32504,
						message: "Not Authorized! Invalid credentials 3",
					},
				});
			}
			const file = JSON.parse(data);
			const decode = Buffer.from(accessToken, "base64")
				.toString("ascii")
				.split(":");
			if (file.password != decode[1] || file.login != decode[0]) {
				return res.json({
					jsonrpc: "2.0",
					id: req.body.id,
					error: {
						code: -32504,
						message: "Not Authorized! Invalid credentials 4",
					},
				});
			}
			const jsonRPCResponse = await server.receive(req.body);
			if (jsonRPCResponse) {
				if (jsonRPCResponse.error) {
					jsonRPCResponse.error.code = jsonRPCResponse.error.message;
					jsonRPCResponse.error.message = error;
					return res.json(jsonRPCResponse);
				}
				res.json(jsonRPCResponse);
			} else {
				res.sendStatus(204);
			}
		});
	} catch (error) {
		return res.json(new RpcError(-31003, "Internal Server Error"));
	}
};
exports.clickGetInfo = async (req, res) => {
	try {
		if (!req.body.params.order_id) {
			return res.json({
				error: -8,
				error_note: "Ошибка в запросе от CLICK ",
			});
		}
		const order = await Orders.findById(req.body.params.order_id);
		if (!order) {
			return res.json({
				error: -5,
				error_note:
					"Не найден пользователь/заказ исходя из присланных данных платежа",
			});
		}
		if (order.pay.status == "payed") {
			return res.json({
				error: -4,
				error_note: "Транзакция ранее была подтверждена",
			});
		}
		if (order.pay.status == "cancelled") {
			return res.json({
				error: -9,
				error_note: "Транзакция ранее была отменена",
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
		}
		return res.json({
			error: 0,
			error_note: "Успешно",
			params: {
				amount: totalAmount,
				caller_id: order.userId,
				phone_num: order.phone.number,
				order_num: order._id,
			},
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
exports.clickPrepare = async (req, res) => {
	try {
		if (req.body.error != 0) {
			return res.json({
				error: -8,
				error_note: "Ошибка в запросе от CLICK ",
			});
		}
		const id = +new Date();
		const order = await Orders.findById(req.body.params.merchant_trans_id);
		if (!order) {
			return res.json({
				error: -5,
				error_note:
					"Не найден пользователь/заказ исходя из присланных данных платежа",
			});
		}
		order.pay.click.click_trans_id = req.body.params.click_trans_id;
		order.pay.click.service_id = req.body.params.service_id;
		order.pay.click.click_paydoc_id = req.body.params.click_paydoc_id;
		order.pay.click.merchant_trans_id = req.body.params.merchant_trans_id;
		order.pay.click.amount = req.body.params.amount;
		order.pay.click.merchant_prepare_id = id;
		await order.save();
		return res.json({
			error: 0,
			error_note: "",
			params: {
				click_trans_id: order.pay.click.click_trans_id,
				merchant_trans_id: order.pay.click.merchant_trans_id,
				merchant_prepare_id: id,
			},
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
exports.clickComplete = async (req, res) => {
	try {
		if (req.body.error != 0) {
			return res.json({
				error: -8,
				error_note: "Ошибка в запросе от CLICK ",
			});
		}
		const order = await Orders.findOne({
			click_trans_id: req.body.params.click_trans_id,
		});
		if (!order) {
			return res.json({
				error: -5,
				error_note:
					"Не найден пользователь/заказ исходя из присланных данных платежа",
			});
		}
		console.log(req.body);
		order.pay.status = "payed";
		order.pay.click.action = req.body.params.action;
		const id = +new Date();
		await order.save();
		return res.json({
			error: 0,
			error_note: "",
			params: {
				click_trans_id: order.pay.click.click_trans_id,
				merchant_trans_id: order.pay.click.merchant_trans_id,
				merchant_confirm_id: id,
			},
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
exports.uzumCheck = async (req, res) => {
	try {
		const order = await Orders.findById(req.body.params.order_id);
		if (!order) {
			return res.status(400).json({
				serviceId: req.body.serviceId,
				timestamp: +new Date(),
				status: "FAILED",
				errorCode: "10003",
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
		}
		return res.json({
			serviceId: req.body.serviceId,
			timestamp: +new Date(),
			status: "OK",
			data: {
				amount: totalAmount * 100,
				phone_number: order.phone.number,
				user_id: order.userId,
			},
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
exports.uzumCreate = async (req, res) => {
	try {
		const order = await Orders.findById(req.body.params.order_id);
		if (!order) {
			return res.status(400).json({
				serviceId: req.body.serviceId,
				timestamp: +new Date(),
				status: "FAILED",
				errorCode: "10003",
			});
		}
		order.pay.uzum.serviceId = req.body.serviceId;
		order.pay.uzum.transId = req.body.transId;
		await order.save();
		let totalAmount = 0;
		for (const product of order.products) {
			const productDoc = await Products.findById(product.product);
			const price = productDoc.sale.isSale
				? productDoc.sale.price
				: productDoc.price;
			const subtotal = price * product.quantity;
			totalAmount += subtotal;
		}
		if (totalAmount * 100 != req.body.amount) {
			return res.status(400).json({
				serviceId: req.body.serviceId,
				transId: req.body.transId,
				transTime: +new Date(),
				status: "FAILED",
				errorCode: "10011",
			});
		}
		return res.json({
			serviceId: req.body.serviceId,
			transId: req.body.transId,
			status: "CREATED",
			transTime: +new Date(),
			data: {
				amount: totalAmount,
				phone_number: order.phone.number,
				user_id: order.userId,
			},
			amount: totalAmount * 100,
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
exports.uzumConfirm = async (req, res) => {
	try {
		const order = await Orders.find({
			"pay.uzum.transId": req.body.transId,
		});
		order.pay.status = "payed";
		order.pay.uzum.serviceId = req.body.serviceId;
		order.pay.uzum.transId = req.body.transId;
		order.pay.uzum.confirmTime = req.body.timestamp;
		order.pay.uzum.status = "CONFIRMED";
		order.pay.uzum.paymentSource = req.body.paymentSource;
		await order.save();
		let totalAmount = 0;
		for (const product of order.products) {
			const productDoc = await Products.findById(product.product);
			const price = productDoc.sale.isSale
				? productDoc.sale.price
				: productDoc.price;
			const subtotal = price * product.quantity;
			totalAmount += subtotal;
		}
		return res.json({
			serviceId: req.body.serviceId,
			transId: req.body.transId,
			status: "CONFIRMED",
			confirmTime: +new Date(),
			amount: totalAmount * 100,
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
exports.uzumReverse = async (req, res) => {
	try {
		const order = await Orders.find({
			"pay.uzum.transId": req.body.transId,
		});
		if (!order) {
			return res.status(400).json({
				serviceId: req.body.serviceId,
				transId: req.body.transId,
				status: "FAILED",
				reverseTime: +new Date(),
				errorCode: "10014",
			});
		}
		order.pay.status = "cancelled";
		order.pay.uzum.status = "REVERSED";
		order.pay.uzum.reverseTime = req.body.timestamp;
		await order.save();
		let totalAmount = 0;
		for (const product of order.products) {
			const productDoc = await Products.findById(product.product);
			const price = productDoc.sale.isSale
				? productDoc.sale.price
				: productDoc.price;
			const subtotal = price * product.quantity;
			totalAmount += subtotal;
		}
		return res.json({
			serviceId: req.body.serviceId,
			transId: req.body.transId,
			status: "REVERSED",
			reverseTime: +new Date(),
			amount: totalAmount * 100,
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
exports.uzumStatus = async (req, res) => {
	try {
		const order = await Orders.find({
			"pay.uzum.transId": req.body.transId,
		});
		if (!order) {
			return res.status(400).json({
				serviceId: req.body.serviceId,
				transId: req.body.transId,
				status: "FAILED",
				reverseTime: +new Date(),
				errorCode: "10014",
			});
		}
		return res.json({
			serviceId: req.body.serviceId,
			transId: order.pay.uzum.transId,
			status: order.pay.uzum.status,
			transTime: order.pay.uzum.transTime,
			confirmTime: order.pay.uzum.confirmTime,
			reverseTime: order.pay.uzum.reverseTime,
			amount: order.pay.uzum.amount * 100,
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
