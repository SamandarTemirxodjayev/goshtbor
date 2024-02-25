const {v4: uuidv4} = require("uuid");
const bcrypt = require("bcrypt");
const {sendEmail} = require("../utils/mail");
const Confirmations = require("../models/Confirmation");
const Users = require("../models/Users");
const {createToken} = require("../utils/token");
const {sendSMS} = require("../utils/SMS");

exports.postRegister = async (req, res) => {
	try {
		const {type, data} = req.body;

		const user = await Users.findOne({
			$or: [{email: data}, {phone: data}],
		});
		if (user) {
			return res.status(400).json({
				status: "error",
				message: "User already exists",
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
					message: "Confirmation already exists",
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

		const id = uuidv4();
		let code = Math.floor(1000 + Math.random() * 9000);

		if (type == "email") {
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
				status: "success",
				message: "Email sent",
				data: {
					id: newConfirmation._id,
					uuid: id,
					type: "email",
					createdAt: newConfirmation.createdAt,
					expiredAt: newConfirmation.expiredAt,
				},
			});
		} else if (type == "phone") {
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
				status: "success",
				message: "SMS sent",
				data: {
					id: newConfirmation._id,
					uuid: id,
					type: "phone",
					createdAt: newConfirmation.createdAt,
					expiredAt: newConfirmation.expiredAt,
				},
			});
		}
		return res.json({message: "Invalid request"});
	} catch (error) {
		return res.status(500).send(error);
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
				message: "Confirmation not found",
			});
		}
		const {expired, confirmation} = await Confirmations.checkAndDeleteExpired(
			uuid,
		);

		if (expired) {
			return res.status(400).json({
				status: "error",
				message: "Confirmation expired. send new code",
			});
		}

		const isMatch = await bcrypt.compare(code.toString(), confirmation.code);
		if (!isMatch) {
			return res.status(400).json({
				status: "error",
				message: "Invalid code",
			});
		}
		const newUser = new Users();

		if (confirmation.type == "email") {
			newUser.email = confirmation.data;
		} else if (confirmation.type == "phone") {
			newUser.phone = confirmation.data;
		} else {
			return res.status(400).json({
				status: "error",
				message: "Invalid type",
			});
		}

		await Confirmations.findOneAndDelete({uuid});
		await newUser.save();

		const token = await createToken(newUser._id);

		return res.json({
			status: "success",
			message: "Confirmed",
			data: {
				auth_token: token,
				token_type: "bearer",
				createdAt: new Date(),
				expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			},
		});
	} catch (error) {
		return res.status(500).send(error);
	}
};
