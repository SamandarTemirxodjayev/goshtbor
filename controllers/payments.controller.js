const {JSONRPCServer} = require("json-rpc-2.0");
const Orders = require("../models/Orders");
const server = new JSONRPCServer();

server.addMethod("CheckPerformTransaction", (params) => {
	const order = Orders.findById(params.account.order_id);
	if (!order) {
		return {
			error: -31003,
		};
	}
	return {
		allow: true,
	};
});
server.addMethod("CreateTransaction", (params) => {
	const order = Orders.findById(params.account.order_id);
	if (!order) {
		return {
			error: -31003,
		};
	}
	return {
		create_time: params.time,
    transaction: order._id,
    state: 1
	};
});
server.addMethod("CheckTransaction", (params) => {
	console.log(params);
	return true;
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
