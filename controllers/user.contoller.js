const Confirmations = require("../models/Confirmation");
const Users = require("../models/Users");
const {v4: uuidv4} = require("uuid");
const bcrypt = require("bcrypt");
const {createToken} = require("../utils/token");
const {sendEmail} = require("../utils/mail");
const {sendSMS} = require("../utils/SMS");
const {getMulticardToken} = require("../utils/authTokenMulticard");
const axios = require("axios");
const https = require("https");

exports.getUser = async (req, res) => {
	try {
		let user;
		let data;

		if (req.userId.email) {
			user = await Users.findOne({email: req.userId.email});
			data = user;
		} else if (req.userId.phone) {
			user = await Users.findOne({phone: req.userId.phone});
			data = user;
		} else if (req.userId.google && req.userId.google.email) {
			user = await Users.findOne({"google.email": req.userId.google.email});
			data = {
				...user._doc,
				...(user.google &&
					Object.keys(user.google).length > 0 && {...user.google}),
			};
			delete data.google;
		} else if (req.userId.apple_id && req.userId.apple_id.id) {
			user = await Users.findOne({"apple_id.id": req.userId.apple_id.id});
			data = {
				...user._doc,
				...(user.apple_id &&
					Object.keys(user.apple_id).length > 0 && {...user.apple_id}),
			};
			delete data.apple_id;
		} else if (req.userId.telegram && req.userId.telegram.id) {
			user = await Users.findOne({"telegram.id": req.userId.telegram.id});
			data = {
				...user._doc,
				...(user.telegram &&
					Object.keys(user.telegram).length > 0 && {...user.telegram}),
			};
			delete data.telegram;
		} else if (req.userId.facebook && req.userId.facebook.id) {
			user = await Users.findOne({"facebook.id": req.userId.facebook.id});
			data = {
				...user._doc,
				...(user.facebook &&
					Object.keys(user.facebook).length > 0 && {...user.facebook}),
			};
			delete data.facebook;
		}

		if (!user) {
			return res.status(404).json({message: "User not found", status: 404});
		}

		res.status(200).json({
			data,
			message: "Foydalanuvchi Tizimdan Yuklab Olindi",
			status: 200,
		});
	} catch (err) {
		res.status(500).json({message: "Internal Server Error", status: 500});
	}
};
exports.getFullUserInformation = async (req, res) => {
	try {
		return res.json({
			status: "success",
			data: req.userId,
			message: "Success",
		});
	} catch (error) {
		return res.status(500).json({error});
	}
};
exports.postUser = async (req, res) => {
	try {
		const {data, type} = req.body;
		if (type === "email") {
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
		if (req.body.oneSignalId) {
			req.userId.oneSignalId = req.body.oneSignalId;
		}
		if (req.body.deviceId) {
			req.userId.deviceId = req.body.deviceId;
		}
		if (req.body.birth_date) {
			req.userId.birth_date = req.body.birth_date;
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
		return res.status(500).json({error: error.message});
	}
};
exports.postUserEditPhone = async (req, res) => {
	try {
		const {type, data} = req.body;

		const user = await Users.findOne({
			$or: [{email: data}, {phone: data}],
		});

		if (user) {
			return res.status(400).json({
				status: "error",
				message: "Boshqa Telefon raqam yoki Elektron pochtani kiriting",
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
				oldData: req.userId.email,
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
			await sendSMS(data, code);
			let hashedCode = await bcrypt.hash(code.toString(), 13);

			const newConfirmation = new Confirmations({
				type: "phone",
				code: hashedCode,
				uuid: id,
				data,
				oldData: req.userId.phone,
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
		}
		return res.json({message: "Invalid request"});
	} catch (error) {
		return res.status(500).json(error);
	}
};
exports.postUserEditPhoneUUID = async (req, res) => {
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

		if (confirmation.type == "email") {
			req.userId.email = confirmation.data;
		} else if (confirmation.type == "phone") {
			req.userId.phone = confirmation.data;
		} else {
			return res.status(400).json({
				status: "error",
				message: "Invalid type",
			});
		}

		await req.userId.save();

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
		return res.status(500).json(error);
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
exports.deleteUserProfile = async (req, res) => {
	try {
		await Users.findByIdAndDelete(req.userId._id);
		return res.status(200).json({
			status: 200,
			message: "Foydalanuvchi O'chirildi",
		});
	} catch (error) {
		return res.status(500).send(error);
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
exports.addLocation = async (req, res) => {
	try {
		req.userId.locations.push(req.body);
		await req.userId.save();
		return res.json({
			status: 200,
			message: "Yangi Lokatsiya qoshildi",
			data: req.userId,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).send(error);
	}
};
exports.editLocation = async (req, res) => {
	try {
		// Get the location _id from req.params.id
		const locationId = req.params.id;

		// Find the location within the user's locations array
		const locationIndex = req.userId.locations.findIndex(
			(location) => location._id.toString() === locationId,
		);

		// Check if the location exists
		if (locationIndex === -1) {
			return res.status(404).json({
				status: 404,
				message: "Location not found",
			});
		}

		// Update the location with the new data from req.body
		req.userId.locations[locationIndex] = {
			...req.userId.locations[locationIndex], // Keep the old values
			...req.body, // Overwrite with new values
		};

		// Save the updated user document
		await req.userId.save();

		return res.json({
			status: 200,
			message: "Location updated successfully",
			data: req.userId,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).send(error);
	}
};
exports.deleteLocation = async (req, res) => {
	try {
		const user = await Users.findByIdAndUpdate(
			req.userId,
			{
				$pull: {locations: {_id: req.params.id}},
			},
			{new: true},
		);

		if (!user) {
			return res.status(404).json({
				status: 404,
				message: "User not found",
			});
		}

		return res.json({
			status: 200,
			message: "Location deleted successfully",
			data: user,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({error: error.message});
	}
};
exports.addCard = async (req, res) => {
	try {
		const {token} = await getMulticardToken();
		const agent = new https.Agent({
			rejectUnauthorized: false,
		});

		const response = await axios.post(
			process.env.MULTICARD_CONNECTION_API + "/payment/card",
			{
				...req.body,
			},
			{
				httpsAgent: agent,
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);
		const newCardToken = response.data.data.card_token;

		// Check if card with the same token already exists for the user
		const existingCard = req.userId.cards.find(
			(card) => card.card_token === newCardToken,
		);

		// If the card already exists, return the existing card
		if (existingCard) {
			return res.json({
				status: false,
				message: "Card already exists",
				data: existingCard,
			});
		}

		return res.json({
			status: true,
			message: "Need submit card",
			data: response.data.data,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({error: error.message});
	}
};
exports.submitAddingCard = async (req, res) => {
	try {
		const {token} = await getMulticardToken();
		const agent = new https.Agent({
			rejectUnauthorized: false,
		});

		const response = await axios.put(
			process.env.MULTICARD_CONNECTION_API + "/payment/card/" + req.params.id,
			{
				...req.body,
			},
			{
				httpsAgent: agent,
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);
		console.log(response);
		req.userId.cards.push(response.data.data);
		await req.userId.save();
		return res.json({
			status: true,
			message: "Card was successfully submitted",
			data: response.data.data,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({error: error.message});
	}
};
exports.deleteCard = async (req, res) => {
	try {
		const user = await Users.findOneAndUpdate(
			{_id: req.userId._id},
			{$pull: {cards: {_id: req.params.id}}}, // Pull the card from the array by _id
			{new: true}, // Return the updated document
		);

		if (!user) {
			return res.status(404).json({
				status: false,
				message: "scard does not exist",
			});
		}

		return res.json({
			status: true,
			message: "Card deleted successfully",
			data: user.cards, // Return the updated cards array if needed
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({error: error.message});
	}
};
