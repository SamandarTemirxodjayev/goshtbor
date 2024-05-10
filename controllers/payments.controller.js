const {JSONRPCServer} = require("json-rpc-2.0");
const RpcError = require("json-rpc-error");
const Orders = require("../models/Orders");
const server = new JSONRPCServer();

server.addMethod("CheckPerformTransaction", async (params) => {
	const order = await Orders.findById(params.account.order_id);
	if (!order) {
		throw new RpcError({
			code: -31060,
			message: "Order not found",
		});
	}
	return {
		allow: true,
	};
});

server.addMethod("CreateTransaction", async (params) => {
	const order = await Orders.findById(params.account.order_id);
	if (!order) {
		throw new RpcError({
			code: -31060,
			message: "Order not found",
		});
	}
	if (order.pay.payme.id) {
		if (order.pay.payme.id != params.id) {
			throw new RpcError({
				code: -31060,
				message: "Order not found",
			});
		}
	}
	order.pay.payme.create_time = params.time;
	order.pay.payme.id = params.id;
	order.pay.payme.amount = params.amount;
	await order.save();

	return {
		create_time: params.time,
		transaction: order._id,
		state: 1,
	};
});

server.addMethod("CheckTransaction", async (params) => {
	const order = await Orders.findOne({
		"pay.payme.id": params.id,
	});
	if (!order) {
		throw new Error(-31060);
	}
	return {
		create_time: order.pay.payme.create_time,
		perform_time: order.pay.payme.perform_time,
		cancel_time: order.pay.payme.cancel_time,
		transaction: order._id,
		state: 1,
		reason: order.pay.payme.reason,
	};
});

exports.test = async (req, res) => {
	try {
		const jsonRPCRequest = req.body;
		const jsonRPCResponse = await server.receive(jsonRPCRequest);
		if (jsonRPCResponse) {
			res.json(jsonRPCResponse);
		} else {
			res.sendStatus(204);
		}
	} catch (error) {
		if (error instanceof RpcError) {
			res.status(200).json({
				jsonrpc: "2.0",
				id: jsonRPCRequest.id,
				error: {
					code: error.code,
					message: error.message,
				},
			});
		} else {
			res.status(500).json({message: error.message});
		}
	}
};
