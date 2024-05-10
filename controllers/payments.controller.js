const {JSONRPCServer} = require("json-rpc-2.0");
const RpcError = require("json-rpc-error");
const Orders = require("../models/Orders");
const server = new JSONRPCServer();

server.addMethod("CheckPerformTransaction", async (params) => {
	const order = await Orders.findById(params.account.order_id);
	if (!order) {
		throw new RpcError(-31060, "Order not found");
	}
	return {
		allow: true,
	};
});
server.addMethod("CancelTransaction", async (params) => {
	const order = await Orders.findOne({
		"pay.payme.id": params.id,
	});
	if (!order) {
		throw new RpcError(-31060, "Order not found");
	}
	if (order.pay.payme.cancel_time == 0) {
		order.pay.payme.cancel_time = +new Date();
		order.pay.payme.state = -2;
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
		throw new RpcError(-31060, "Order not found");
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
	const order = await Orders.findById(params.account.order_id);
	if (!order) {
		throw new RpcError(-31060, "Order not found");
	}
	if (order.pay.payme.id && order.pay.payme.id != params.id) {
		throw new RpcError(-31060, "Incorrect order ID");
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
		throw new RpcError(-31060, "Transaction not found");
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
	try {
		const jsonRPCRequest = req.body;
		const jsonRPCResponse = await server.receive(jsonRPCRequest);
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
	} catch (error) {
		res.status(500).json({message: error.message});
	}
};
