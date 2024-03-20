const Users = require("../models/Users");

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
exports.postUser = async (req, res) => {
	try {
		const {data, type} = req.body;
		if (type === "email") {
			console.log(req.body);
			const user = await Users.findOne({email: data});
			if (!user) {
				return res
					.status(404)
					.json({status: 404, message: "Foydalanuvchi Tizimda Mavjud Emas"});
			}
			return res.status(200).json({
				status: 200,
				message: "Foydalanuvchi Yuklab Olindi",
				data: user,
			});
		}
		return res.status(400).json({status: 400, message: "Invalid type"});
	} catch (error) {
		return res.status(500).json({
			status: 500,
			message: error.message,
		});
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
exports.getAllUsers = async (req, res) => {
	try {
		const users = await Users.find();
		return res.status(200).json({
			status: 200,
			message: "Foydalanuvchilar Muvaffaqiyatli Yuklab Olindi",
			data: users,
		});
	} catch (error) {
		return res.status(500).json(error);
	}
};
exports.deleteUser = async (req, res) => {
	try {
		await Users.findByIdAndDelete(req.params.id);
		return res.status(200).json({
			status: 200,
			message: "Foydalanuvchi O'chirildi",
		});
	} catch (error) {
		return res.status(500).send(error);
	}
};
