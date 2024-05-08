const {JSONRPCServer} = require("json-rpc-2.0");
const RpcError = require("json-rpc-error");
const Orders = require("../models/Orders");
const server = new JSONRPCServer();

server.addMethod("CheckPerformTransaction", async (params) => {
	const order = await Orders.findById(params.account.order_id);
	if (!order) {
		throw new RpcError(-31003, -31003);
	}
	return {
		allow: true,
	};
});
server.addMethod("CreateTransaction", async (params) => {
	const order = await Orders.findById(params.account.order_id);
	if (!order) {
		throw new RpcError(-31003, -31003);
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
		throw new RpcError(-31003, -31003);
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
		// server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
		// It can also receive an array of requests, in which case it may return an array of responses.
		// Alternatively, you can use server.receiveJSON, which takes JSON string as is (in this case req.body).
		server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
			if (jsonRPCResponse) {
				res.json(jsonRPCResponse);
			} else {
				// If response is absent, it was a JSON-RPC notification method.
				// Respond with no content status (204).
				res.sendStatus(204);
			}
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
