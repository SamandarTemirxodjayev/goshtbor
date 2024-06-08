const Collectors = require("../models/Collectors");
const {createToken} = require("../utils/token");

exports.createCollector = async (req, res) => {
	try {
		const collector = await Collectors.create({
			name: req.body.name,
			surname: req.body.surname,
			login: req.body.login,
			password: req.body.password,
		});
		await collector.save();
		return res.json({
			message: "success",
			status: "success",
			data: collector,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
			data: error,
		});
	}
};
exports.loginCollector = async (req, res) => {
	try {
		const collector = await Collectors.findOne({
			login: req.body.login,
		});
		console.log(collector);
		if (!collector) {
			return res.status(400).json({
				message: "Login Xato",
				status: "error",
				data: [],
			});
		}
		if (collector.password != req.body.password) {
			return res.status(400).json({
				message: "Parol Xato",
				status: "error",
				data: [],
			});
		}
		const token = createToken(collector._id);
		return res.json({
			message: "Confirmed",
			status: "success",
			data: {
				auth_token: token,
				token_type: "bearer",
				createdAt: new Date(),
				expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			},
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			status: "error",
			data: error,
		});
	}
};
