const {JSONRPCServer} = require("json-rpc-2.0");
const RpcError = require("json-rpc-error");
const Orders = require("../models/Orders");
const Products = require("../models/Products");
const server = new JSONRPCServer();
const fs = require("fs");
const mongoose = require("mongoose");

let error = "";

server.addMethod("CheckPerformTransaction", async (params) => {
	let orderId;
	try {
		orderId = new mongoose.Types.ObjectId(params.account.order_id);
	} catch (error) {
		error = "Buyurtma Topilmadi";
		throw new RpcError(-31060, "Invalid order ID format");
	}

	let order = await Orders.findById(orderId);
	if (!order) {
		error = "Buyurtma Topilmadi";
		throw new RpcError(-31061, "Order not found");
	}

	let totalAmount = 0;
	let receiptItems = [];

	for (const product of order.products) {
		const productDoc = await Products.findById(product.product);
		if (!productDoc) {
			error = "Mahsulot Topilmadi";
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
		error = "Buyurtma Summasida Xatolik. Buyurtmani To'liq summasini kiriting";
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
	console.log(orders);
	return {
		transactions: orders,
	};
});
server.addMethod("CancelTransaction", async (params) => {
	const order = await Orders.findOne({
		"pay.payme.id": params.id,
	});
	if (!order) {
		error = "Buyurtma Topilmadi";
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
		error = "Buyurtma Topilmadi";
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
		orderId = new mongoose.Types.ObjectId(params.account.order_id);
	} catch (error) {
		error = "Buyurtma Topilmadi";
		throw new RpcError(-31060, "Invalid order ID format");
	}
	const order = await Orders.findById(orderId);
	if (!order) {
		error = "Buyurtma Topilmadi";
		throw new RpcError(-31060, "Order not found");
	}
	if (order.pay.payme.id && order.pay.payme.id != params.id) {
		error = "Buyurtma Topilmadi";
		throw new RpcError(-31060, "Incorrect order ID");
	}

	let totalAmount = 0;
	for (const product of order.products) {
		const productDoc = await Products.findById(product.product);
		if (!productDoc) {
			error = "Mahsulot Topilmadi";
			throw new RpcError(-31060, "Product not found in order");
		}

		const price = productDoc.sale.isSale
			? productDoc.sale.price
			: productDoc.price;
		const subtotal = price * product.quantity;
		totalAmount += subtotal;
	}
	if (totalAmount * 100 !== params.amount) {
		error = "Buyurtma Summasida Xatolik. Buyurtmani To'liq summasini kiriting";
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
		error = "Buyurtma Topilmadi";
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

exports.test = async (req, res) => {
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
		console.log(error);
		return res.json(new RpcError(-31003, "Internal Server Error"));
	}
};
