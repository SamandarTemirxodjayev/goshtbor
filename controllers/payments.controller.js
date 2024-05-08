const {JSONRPCServer} = require("json-rpc-2.0");
const server = new JSONRPCServer();

server.addMethod("CheckTransaction", (params) => {
	console.log(params);
});

exports.test = async (req, res) => {
	try {
		console.log(req.body);
		const request = req.body;
		const response = server.handle(request);
		res.json(response);
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
