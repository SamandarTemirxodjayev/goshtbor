const {default: mongoose} = require("mongoose");
const Messages = require("../models/Messages");
const {wsMessager} = require("../ws/message");
const Users = require("../models/Users");

exports.getUserMessages = async (req, res) => {
	try {
		const messages = await Messages.find({
			user: req.userId,
		})
			.populate("user")
			.populate("admin");
		return res.json({
			data: messages,
			status: "success",
			message: "success",
		});
	} catch (error) {
		return res.status(500).json({error});
	}
};
exports.getUserMessagesById = async (req, res) => {
	try {
		const messages = await Messages.find({
			user: new mongoose.Types.ObjectId(req.params.id),
		});
		return res.json({
			data: messages,
			status: "success",
			message: "success",
		});
	} catch (error) {
		return res.status(500).json({error});
	}
};
exports.getUserAdminMessages = async (req, res) => {
	try {
		const messages = await Messages.find({
			user: new mongoose.Types.ObjectId(req.body.userId),
			admin: req.helperId,
		});
		return res.json({
			data: messages,
			status: "success",
			message: "success",
		});
	} catch (error) {
		return res.status(500).json({error});
	}
};
exports.getChats = async (req, res) => {
	try {
		const users = await Users.find();
		return res.json({
			data: users,
			status: "success",
			message: "success",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({error});
	}
};
exports.saveMessageUser = async (req, res) => {
	try {
		const message = await Messages.create({
			user: req.userId,
			message: req.body.message,
		});
		await message.save();
		wsMessager(message);
		return res.json({
			data: message,
			status: "success",
			message: "success",
		});
	} catch (error) {
		return res.status(500).json({error});
	}
};
exports.saveMessageAdmin = async (req, res) => {
	try {
		const message = await Messages.create({
			user: new mongoose.Types.ObjectId(req.body.userId),
			is_admin: true,
			message: req.body.message,
			admin: req.helperId,
		});
		await message.save();
		wsMessager(message);
		return res.json({
			data: message,
			status: "success",
			message: "success",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({error});
	}
};
