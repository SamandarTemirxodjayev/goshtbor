const express = require("express");
const {v4: uuidv4} = require("uuid");
const bcrypt = require("bcrypt");
const {sendEmail} = require("../utils/mail");
const Confirmations = require("../models/Confirmation");
const Users = require("../models/Users");
const {createToken} = require("../utils/token");
const {sendSMS} = require("../utils/SMS");

let router = express.Router();

router.post("/", async (req, res) => {
	try {
		const {type, data} = req.body;
		const user = await Users.findOne({data});
		if (user) {
			return res.status(400).json({
				status: "error",
				message: "User already exists",
			});
		}
		const confirmation = await Confirmations.findOne({data});
		if (confirmation) {
			return res.status(400).json({
				status: "waiting",
				message: "Confirmation already exists",
				data: {
					uuid: confirmation.uuid,
					type: confirmation.type,
				},
			});
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
					uuid: id,
					type: "email",
					createdAt: newConfirmation.createdAt,
					expiredAt: newConfirmation.expiredAt,
				},
			});
		} else if (type == "phone") {
			await sendSMS(data, code);
			return res.json("success");
		}
		return res.json({message: "Invalid request"});
	} catch (error) {
		return res.status(500).send(error);
	}
});

router.post("/:uuid", async (req, res) => {
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
		const newUser = new Users({
			data: confirmation.data,
		});
		await newUser.save();
		await Confirmations.findOneAndDelete({uuid});
		const token = await createToken(newUser._id);
		return res.json({
			status: "success",
			message: "Email confirmed",
			data: {
				authPlugin: token,
				createdAt: new Date(),
				expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			},
		});
	} catch (error) {
		return res.status(500).send(error);
	}
});

module.exports = router;
