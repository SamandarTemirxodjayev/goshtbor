const jwt = require("jsonwebtoken");
const Users = require("../models/Users");

async function UserMiddleware(req, res, next) {
	const authorizationHeader = req.headers.authorization;
	if (!authorizationHeader) {
		return res
			.status(401)
			.json({
				error: "Not Authorized!",
				message: "Missing authorization header",
			})
			.set({
				"Content-Type": "application/json",
				"WWW-Authenticate": 'Bearer realm="api"',
			});
	}

	const accessToken = authorizationHeader.split(" ")[1];
	if (!accessToken) {
		return res
			.status(401)
			.json({error: "Not Authorized!", message: "Invalid access token"});
	}

	try {
		const decoded = jwt.verify(accessToken, "Samandar0321@02212006H193OC");
		const user = await Users.findById(decoded._id);
		if (!user) {
			return res
				.status(401)
				.json({error: "Not Authorized!", message: "Invalid access token"});
		}
		req.userId = user;
		if (req.userId.user_level === 0) {
			return res.status(400).json({
				status: "error",
				message: "You are not authorized to perform this action",
			});
		}
		return next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return res
				.status(401)
				.json({error: "Not Authorized!", message: "Invalid access token"});
		}
		return res
			.status(500)
			.json({error: "Internal Server Error", message: "An error occurred"});
	}
}

module.exports = UserMiddleware;
