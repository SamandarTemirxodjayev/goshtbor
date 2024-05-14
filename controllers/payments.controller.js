const {JSONRPCServer} = require("json-rpc-2.0");
const RpcError = require("json-rpc-error");
const Orders = require("../models/Orders");
const Products = require("../models/Products");
const server = new JSONRPCServer();
const fs = require("fs");

server.addMethod("CheckPerformTransaction", async (params) => {
	const order = await Orders.findById(params.account.order_id);
	if (!order) {
		throw new RpcError(-31060, "Order not found");
	}
	let totalAmount = 0;
	for (const product of order.products) {
		const productDoc = await Products.findById(product.product);
		if (!productDoc) {
			throw new RpcError(-31060, "Order not found");
		}

		const price = productDoc.sale.isSale
			? productDoc.sale.price
			: productDoc.price;
		const subtotal = price * product.quantity;
		totalAmount += subtotal;
	}
	if (totalAmount != params.amount) {
		throw new RpcError(-31001, "Order not found");
	}

	return {
		allow: true,
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
		throw new RpcError(-32504, "Order not found");
	}
	if (order.pay.payme.cancel_time == 0) {
		order.pay.payme.cancel_time = +new Date();
		order.pay.payme.state = -2;
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
	const order = await Orders.findOne({
		_id: params.account.order_id,
	});
	if (!order) {
		throw new RpcError(-31060, "Order not found");
	}
	if (order.pay.payme.id && order.pay.payme.id != params.id) {
		throw new RpcError(-31060, "Incorrect order ID");
	}

	let totalAmount = 0;
	for (const product of order.products) {
		const productDoc = await Products.findById(product.product);
		if (!productDoc) {
			throw new RpcError(-31060, "Order not found");
		}

		const price = productDoc.sale.isSale
			? productDoc.sale.price
			: productDoc.price;
		const subtotal = price * product.quantity;
		totalAmount += subtotal;
	}

	if (totalAmount != params.amount) {
		throw new RpcError(-31001, "Order not found");
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
					jsonRPCResponse.error.message = "Order not found";
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

	// try {
	// 	const jsonRPCResponse = await server.receive(req.body);
	// 	if (jsonRPCResponse) {
	// 		if (jsonRPCResponse.error) {
	// 			jsonRPCResponse.error.code = jsonRPCResponse.error.message;
	// 			jsonRPCResponse.error.message = "Order not found";
	// 			return res.json(jsonRPCResponse);
	// 		}
	// 		res.json(jsonRPCResponse);
	// 	} else {
	// 		res.sendStatus(204);
	// 	}
	// } catch (error) {
	// 	res.status(500).json({message: error.message});
	// }
};
