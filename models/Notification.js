const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
	photo_url: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
	readBy: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},
	],
});

notificationSchema.set("timestamps", true);

const Notification = mongoose.model("notifications", notificationSchema);

module.exports = Notification;
