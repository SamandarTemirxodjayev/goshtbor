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

		if (type == "email") {
			const user = await Users.findOne({
				email: data,
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
			const user = await Users.findOne({
				phone: data,
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
				message: "SMS sent",
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
				"google.email": data.email,
				"google.id": data.id,
			});

			if (user) {
				return res.status(400).json({
					status: "error",
					message: "User already exists",
				});
			}
			const newUser = new Users({
				google: {
					token: data.token,
					code: data.code,
					id: data.id,
					email: data.email,
				},
				name: data.name,
			});
			await newUser.save();
			const token = createToken(newUser._id);

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
				"apple_id.id": data.id,
			});

			if (user) {
				return res.status(400).json({
					status: "error",
					message: "User already exists",
				});
			}
			const newUser = new Users({
				apple_id: {
					token: data.token,
					code: data.code,
					id: data.id,
					email: data.email,
				},
				name: data.name,
			});
			await newUser.save();
			const token = createToken(newUser._id);

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

			if (user) {
				return res.status(400).json({
					status: "error",
					message: "User already exists",
				});
			}
			const newUser = new Users({
				telegram: {
					auth_date: data.auth_date,
					id: data.id,
					hash: data.hash,
				},
				name: data.first_name,
				surname: data.last_name,
				photo_url: data.photo_url,
			});
			await newUser.save();
			const token = createToken(newUser._id);

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
		} else if (type == "facebook") {
			const user = await Users.findOne({
				"facebook.id": data.id,
				"facebook.email": data.email,
			});

			if (user) {
				return res.status(400).json({
					status: "error",
					message: "User already exists",
				});
			}
			const newUser = new Users({
				facebook: {
					email: data.email,
					id: data.id,
				},
				name: data.first_name,
				surname: data.last_name,
			});
			await newUser.save();
			const token = createToken(newUser._id);

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

		const token = createToken(newUser._id);

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
	} catch (error) {
		return res.status(500).send(error);
	}
};
