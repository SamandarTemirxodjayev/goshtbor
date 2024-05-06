const Orders = require("../models/Orders");
const {v4: uuidv4} = require("uuid");
const {sendSMS} = require("../utils/SMS");
const {createHash, compare} = require("../utils/codeHash");
const Confirmations = require("../models/Confirmation");

exports.getAllOrders = async (req, res) => {
	try {
		const orders = await Orders.find({
			userId: req.userId._id,
		}).populate("products.product");
		return res.json({
			status: "success",
			data: orders,
		});
	} catch (error) {
		return res.status(500).json({error: error});
	}
};
exports.createOrder = async (req, res) => {
	try {
		let code = Math.floor(1000 + Math.random() * 9000);
		const newOrder = new Orders({
			userId: req.userId._id,
			delivery: {
				date: req.body.delivery.date,
				address: {
					longitude: req.body.delivery.address.longitude,
					latitude: req.body.delivery.address.latitude,
				},
			},
			"phone.number": req.body.phone.number,
			"phone.confirm_code": await createHash(code),
			products: req.body.products,
			comment: req.body.comment || "",
		});
		await newOrder.save();
		return res.json({
			status: "success",
			data: newOrder,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({error: error});
	}
};
exports.confirmationCode = async (req, res) => {
	try {
		const {number} = req.body.phone;

		let confirmationw = await Confirmations.findOne({data: number});

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

		let code = Math.floor(1000 + Math.random() * 9000);
		await sendSMS(number, code);
		const newConfirmation = new Confirmations({
			code: await createHash(code),
			uuid: uuidv4(),
			data: number,
			type: "phone",
			expiredAt: new Date(Date.now() + 1000 * 2 * 60),
		});
		await newConfirmation.save();
		return res.json({status: "success", data: newConfirmation});
	} catch (error) {
		return res
			.json({
				error,
			})
			.status(500);
	}
};
exports.confirmationCodeUUID = async (req, res) => {
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

		const isMatch = await compare(code.toString(), confirmation.code);
		if (!isMatch) {
			return res.status(400).json({
				status: "error",
				message: "Invalid code",
			});
		}
		await Confirmations.findOneAndDelete({uuid});

		return res.json({
			status: 200,
			message: "Confirmed",
		});
	} catch (error) {
		return res.status(500).json(error);
	}
};
