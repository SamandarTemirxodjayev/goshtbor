const Messages = require("../models/Messages");

exports.getMessages = async (req, res) => {
	try {
		const messages = await Messages.find({
			user: req.userId,
		});
		return response.json({
			data: messages,
			status: "success",
			message: "success",
		});
	} catch (error) {
		return res.status(500).json({error});
	}
};
