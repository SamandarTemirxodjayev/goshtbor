const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
	photo_url: {
		type: String,
		required: true,
	},
	title_uz: {
		type: String,
		required: true,
	},
	content_uz: {
		type: String,
		required: true,
	},
	title_ru: {
		type: String,
		required: true,
	},
	content_ru: {
		type: String,
		required: true,
	},
	title_en: {
		type: String,
		required: true,
	},
	content_en: {
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
