const fs = require("fs");
const {JSONRPCServer} = require("json-rpc-2.0");
const RpcError = require("json-rpc-error");
const server = new JSONRPCServer();

async function PaymeMiddleware(req, res, next) {
	const authorizationHeader = req.headers.authorization;
	if (!authorizationHeader) {
		return res.status(401).json({
			error: "Not Authorized!",
			message: "Missing authorization header",
		});
	}

	const accessToken = authorizationHeader.split(" ")[1];
	if (!accessToken) {
		return res
			.status(401)
			.json({error: "Not Authorized!", message: "Invalid access token"});
	}

	try {
		fs.readFile("./db/payme.json", "utf8", async (err, data) => {
			if (err) {
				console.error(err);
				return res.status(500).json({error: "Failed to read file"});
			}
			const file = JSON.parse(data);
			const decode = Buffer.from(accessToken, "base64")
				.toString("ascii")
				.split(":");
			if (file.password != decode[1] || file.login != decode[0]) {
				const jsonRPCResponse = await server.receive(req.body);
				if (jsonRPCResponse) {
					if (jsonRPCResponse.error) {
						jsonRPCResponse.error.code = jsonRPCResponse.error.message;
						jsonRPCResponse.error.message =
							"Not Authorized! Invalid credentials";
						return res.json(jsonRPCResponse);
					}
					return next();
				} else {
					res.sendStatus(204);
				}
				const error = new RpcError(
					-32504,
					"Not Authorized! Invalid credentials",
				);
				res.json(error);
			}
			return next();
		});
	} catch (error) {
		const rpcError = new RpcError(-31003, "Internal Server Error");
		throw rpcError;
	}
}

module.exports = PaymeMiddleware;
