const bcrypt = require("bcrypt");

exports.getUser = async (req, res) => {
	try {
		return res.status(200).json({
			status: 200,
			message: "Foydalanuvchi Tizimdan Yuklab Olindi",
			data: req.userId,
		});
	} catch (error) {
		return res.status(500).send(error);
	}
};
exports.postUserEdit = async (req, res) => {
	try {
		if (req.body.name) {
			req.userId.name = req.body.name;
		}
		if (req.body.surname) {
			req.userId.surname = req.body.surname;
		}
		if (req.body.email) {
			req.userId.email = req.body.email;
		}
		if (req.body.photo_url) {
			req.userId.photo_url = req.body.photo_url;
		}
		await req.userId.save();
		return res.status(200).json({
			status: 200,
			message: "Foydalanuvchi Yangilandi",
			data: req.userId,
		});
	} catch (error) {
		return res.status(500).send(error);
	}
};
