const Notification = require("../models/Notification");
const oneSignalClient = require("../utils/oneSignalclient.js");

exports.createNotification = async (req, res) => {
	try {
		const notifications = new Notification({
			photo_url: req.body.photo_url,
			title_uz: req.body.title_uz,
			title_ru: req.body.title_ru,
			title_en: req.body.title_en,
			content_uz: req.body.content_uz,
			content_ru: req.body.content_ru,
			content_en: req.body.content_en,
		});
		await notifications.save();

		const notificationPayload = {
			contents: {
				en: req.body.content_uz,
			},
			headings: {
				en: req.body.title_uz,
			},
			included_segments: ["Subscribed Users"],
		};

		oneSignalClient
			.createNotification(notificationPayload)
			.then((response) => console.log(response))
			.catch((e) => console.error(e));

		return res.json({
			status: 200,
			message: "Notification created",
			data: notifications,
		});
	} catch (error) {
		return res.status(500).json(error);
	}
};
exports.getNotifications = async (req, res) => {
	try {
		const userId = req.userId._id;
		const notifications = await Notification.find();

		const customizedNotifications = notifications.map((notification) => ({
			...notification.toObject(),
			isRead: notification.readBy.includes(userId),
		}));

		res.status(200).send({
			status: 200,
			message: "Notifications",
			data: customizedNotifications,
		});
	} catch (error) {
		res.status(400).send(error);
	}
};
exports.markNotificationAsRead = async (req, res) => {
	try {
		const userId = req.userId._id;
		const notificationId = req.params.id;

		const notification = await Notification.findById(notificationId);

		if (!notification.readBy.includes(userId)) {
			notification.readBy.push(userId);
			await notification.save();
		}

		res.status(200).send({
			status: 200,
			message: "Notification marked as read",
			data: notification,
		});
	} catch (error) {
		res.status(400).send(error);
	}
};
exports.markAsReadAllNotifications = async (req, res) => {
	try {
		const userId = req.userId._id;
		const notifications = await Notification.find();

		const updates = notifications.map(async (notification) => {
			if (!notification.readBy.includes(userId)) {
				notification.readBy.push(userId);
				await notification.save();
			}
		});

		await Promise.all(updates);

		const customizedNotifications = notifications.map((notification) => ({
			...notification.toObject(),
			isRead: notification.readBy.includes(userId),
		}));

		res.status(200).send({
			status: 200,
			message: "Notifications marked as read",
			data: customizedNotifications,
		});
	} catch (error) {
		res.status(400).send(error);
	}
};
exports.deleteNotification = async (req, res) => {
	try {
		await Notification.findByIdAndDelete(req.params.id);
		return res.status(200).send({
			status: 200,
			message: "Notification deleted",
		});
	} catch (error) {
		return res.status(400).send(error);
	}
};
exports.upadateNotification = async (req, res) => {
	try {
		await Notification.findByIdAndUpdate(req.params.id, {
			photo_url: req.body.photo_url,
			title: req.body.title,
			content: req.body.content,
		});
		return res.status(200).send({
			status: 200,
			message: "Notification updated",
		});
	} catch (error) {
		return res.status(400).send(error);
	}
};
