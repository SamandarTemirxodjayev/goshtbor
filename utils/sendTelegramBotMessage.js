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

exports.statusFormat = (id) => {
	if (id == 0) {
		return "Yaratilgan";
	} else if (id == 1) {
		return "To'langan";
	} else if (id == 2) {
		return "Yig'ilgan";
	} else if (id == 3) {
		return "Yetkazilmoqda";
	} else if (id == -9) {
		return "Yaratilgan (Bekor qilingan)";
	} else if (id == -1) {
		return "To'langan (Bekor qilingan)";
	} else if (id == -2) {
		return "Yig'ilgan (Bekor qilingan)";
	} else if (id == -3) {
		return "Yetkazilmoqda (Bekor qilingan)";
	} else {
		return "Yetkazildi";
	}
};