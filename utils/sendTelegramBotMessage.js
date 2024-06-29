const axios = require("axios");
require("dotenv").config();

exports.sendMessageByBot = async (chatId, message) => {
	const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

	try {
		const response = await axios.post(url, {
			chat_id: chatId,
			text: message,
		});
		return response.data;
	} catch (error) {
		return error;
	}
};
