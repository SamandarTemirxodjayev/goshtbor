const Notification = require("../models/Notification");

exports.createNotification = async (req, res) => {
	try {
		if (req.userId.user_level === 0) {
			return res.status(400).json({
				status: "error",
				message: "You are not authorized to perform this action",
			});
		}
		const notifications = new Notification({
			photo_url: req.body.photo_url,
			title: req.body.title,
			content: req.body.content,
		});
		await notifications.save();
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
		if (req.userId.user_level === 0) {
			return res.status(400).json({
				status: "error",
				message: "You are not authorized to perform this action",
			});
		}
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
		if (req.userId.user_level === 0) {
			return res.status(400).json({
				status: "error",
				message: "You are not authorized to perform this action",
			});
		}
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
