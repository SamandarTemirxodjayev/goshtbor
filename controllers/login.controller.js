const Confirmations = require("../models/Confirmation");
const Users = require("../models/Users");
const {v4: uuidv4} = require("uuid");
const bcrypt = require("bcrypt");
const {sendEmail} = require("../utils/mail");
const {createToken} = require("../utils/token");
const {sendSMS} = require("../utils/SMS");

exports.login = async (req, res) => {
	try {
		const {type, data} = req.body;

		const id = uuidv4();
		let code = Math.floor(1000 + Math.random() * 9000);

		if (type == "email") {
			const user = await Users.findOne({
				email: data,
			});
			if (!user) {
				return res.status(400).json({
					status: "error",
					message: "Foydalanuvchi Tizimda Mavjud Emas",
				});
			}
			let confirmationw = await Confirmations.findOne({data});

			if (confirmationw) {
				let {expired, confirmation} = await Confirmations.checkAndDeleteExpired(
					confirmationw.uuid,
				);
				if (!expired) {
					return res.status(400).json({
						status: "waiting",
						message: "OTP kod oldindan jo'natilgan",
						data: {
							id: confirmation._id,
							uuid: confirmation.uuid,
							type: confirmation.type,
							createdAt: confirmation.createdAt,
							expiredAt: confirmation.expiredAt,
						},
					});
				}
			}
			await sendEmail(data, code);
			let hashedCode = await bcrypt.hash(code.toString(), 13);
			const newConfirmation = new Confirmations({
				type: "email",
				code: hashedCode,
				uuid: id,
				data,
				expiredAt: new Date(Date.now() + 1000 * 2 * 60),
			});
			await newConfirmation.save();

			return res.status(200).json({
				status: 200,
				message: "OTP kod elektron pochtaga yuborildi",
				data: {
					id: newConfirmation._id,
					uuid: id,
					type: "email",
					createdAt: newConfirmation.createdAt,
					expiredAt: newConfirmation.expiredAt,
				},
			});
		} else if (type == "phone") {
			const user = await Users.findOne({
				phone: data,
			});
			if (!user) {
				return res.status(400).json({
					status: "error",
					message: "Foydalanuvchi Tizimda Mavjud Emas",
				});
			}
			let confirmationw = await Confirmations.findOne({data});

			if (confirmationw) {
				let {expired, confirmation} = await Confirmations.checkAndDeleteExpired(
					confirmationw.uuid,
				);
				if (!expired) {
					return res.status(400).json({
						status: "waiting",
						message: "OTP kod oldindan jo'natilgan",
						data: {
							id: confirmation._id,
							uuid: confirmation.uuid,
							type: confirmation.type,
							createdAt: confirmation.createdAt,
							expiredAt: confirmation.expiredAt,
						},
					});
				}
			}
			await sendSMS(data, code);
			let hashedCode = await bcrypt.hash(code.toString(), 13);

			const newConfirmation = new Confirmations({
				type: "phone",
				code: hashedCode,
				uuid: id,
				data,
				expiredAt: new Date(Date.now() + 1000 * 2 * 60),
			});
			await newConfirmation.save();

			return res.status(200).json({
				status: 200,
				message: "SMS kod yuborildi",
				data: {
					id: newConfirmation._id,
					uuid: id,
					type: "phone",
					createdAt: newConfirmation.createdAt,
					expiredAt: newConfirmation.expiredAt,
				},
			});
		} else if (type == "google") {
			const user = await Users.findOne({
				"google.token": data.token,
				"google.email": data.email,
			});

			if (!user) {
				return res.status(400).json({
					status: "error",
					message: "User is non-exists",
				});
			}

			const token = await createToken(user._id);

			return res.json({
				status: 200,
				message: "Confirmed",
				data: {
					auth_token: token,
					token_type: "bearer",
					createdAt: new Date(),
					expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
				},
			});
		} else if (type == "apple_id") {
			const user = await Users.findOne({
				"apple_id.token": data.token,
				"apple_id.email": data.email,
			});

			if (!user) {
				return res.status(400).json({
					status: "error",
					message: "User is non-exists",
				});
			}

			const token = await createToken(user._id);

			return res.json({
				status: 200,
				message: "Confirmed",
				data: {
					auth_token: token,
					token_type: "bearer",
					createdAt: new Date(),
					expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
				},
			});
		} else if (type == "telegram") {
			const user = await Users.findOne({
				"telegram.id": data.id,
			});

			if (!user) {
				return res.status(400).json({
					status: "error",
					message: "User is non-exists",
				});
			}

			const token = await createToken(user._id);

			return res.json({
				status: 200,
				message: "Confirmed",
				data: {
					auth_token: token,
					token_type: "bearer",
					createdAt: new Date(),
					expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
				},
			});
		}
		return res.json({message: "Invalid request"});
	} catch (error) {
		return res.status(500).send(error.message);
	}
};
exports.postUUIDConfirm = async (req, res) => {
	try {
		const {uuid} = req.params;
		const {code} = req.body;
		const confirmations = await Confirmations.findOne({uuid});
		if (!confirmations) {
			return res.status(404).json({
				status: "error",
				message: "Xatolik",
			});
		}
		const {expired, confirmation} = await Confirmations.checkAndDeleteExpired(
			uuid,
		);

		if (expired) {
			return res.status(400).json({
				status: "error",
				message: "Qaytadan yuborin, kodni muddati tugagan",
			});
		}

		const isMatch = await bcrypt.compare(code.toString(), confirmation.code);
		if (!isMatch) {
			return res.status(400).json({
				status: "error",
				message: "Kod Xato",
			});
		}

		await Confirmations.findOneAndDelete({uuid});

		const user = await Users.findOne({
			$or: [{email: confirmation.data}, {phone: confirmation.data}],
		});

		const token = await createToken(user._id);

		return res.json({
			status: 200,
			message: "Tasdiqlandi",
			data: {
				auth_token: token,
				token_type: "bearer",
				createdAt: new Date(),
				expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
				user: user,
			},
		});
	} catch (error) {
		return res.status(500).send(error.message);
	}
};
