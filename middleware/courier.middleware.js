const jwt = require("jsonwebtoken");
const Courier = require("../models/Courier");

async function UserMiddleware(req, res, next) {
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
		const decoded = jwt.verify(accessToken, "Samandar0321@02212006H193OC");
		const user = await Courier.findById(decoded._id);
		if (!user) {
			return res
				.status(401)
				.json({error: "Not Authorized!", message: "User Not Found!"});
		}
		req.courierId = user;
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
