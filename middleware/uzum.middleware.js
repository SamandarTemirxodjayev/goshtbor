async function UzumMiddleware(req, res, next) {
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
	const decode = Buffer.from(accessToken, "base64")
		.toString("utf-8")
		.split(":");
	if (decode[0] != "uzum" && decode[1] != "bank") {
		return res
			.status(401)
			.json({error: "Not Authorized!", message: "Invalid access token"});
	}
	try {
		return next();
	} catch (error) {
		return res
			.status(500)
			.json({error: "Internal Server Error", message: "An error occurred"});
	}
}
``;
module.exports = UzumMiddleware;
