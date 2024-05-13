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
		fs.readFile("./db/payme.json", "utf8", (err, data) => {
			if (err) {
				console.error(err);
				return res.status(500).json({error: "Failed to read file"});
			}
			const file = JSON.parse(data);
			const decode = Buffer.from(accessToken, "base64")
				.toString("ascii")
				.split(":");
			if (file.password != decode[1] || file.login != decode[0]) {
				return res.status(500).json({error: "Failed to"});
			}
			return next();
		});
	} catch (error) {
		return res
			.status(500)
			.json({error: "Internal Server Error", message: "An error occurred"});
	}
}

module.exports = PaymeMiddleware;
