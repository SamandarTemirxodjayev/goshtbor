const Notification = require("../models/Notification");
const Users = require("../models/Users.js");
const oneSignalClient = require("../utils/oneSignalclient.js");
const dotenv = require("dotenv");

dotenv.config();

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

		const users = await Users.find().select("oneSignalId");
		const oneSignalIds = users
			.map((user) => user.oneSignalId)
			.filter((id) => id);

		if (oneSignalIds.length > 0) {
			const notificationPayload = {
				contents: {
					en: req.body.content_en,
					uz: req.body.content_uz,
					ru: req.body.content_ru,
				},
				headings: {
					en: req.body.title_en,
					uz: req.body.title_uz,
					ru: req.body.title_ru,
				},
				include_player_ids: oneSignalIds,
			};

			oneSignalClient
				.createNotification(notificationPayload)
				.then((response) => console.log(response))
				.catch((e) => console.error(e));
		}

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
		const page = parseInt(req.query.page) || 1;
		const perPage = parseInt(req.query.perPage) || 10;

		const totalCount = await Notification.countDocuments();
		const totalPages = Math.ceil(totalCount / perPage);

		const notifications = await Notification.find()
			.skip((page - 1) * perPage)
			.limit(perPage);

		const customizedNotifications = notifications.map((notification) => ({
			...notification.toObject(),
			isRead: notification.readBy.includes(userId),
		}));

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalCount,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/notifications?page=${page}&perPage=${perPage}`,
			first: `${url}/api/notifications?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/notifications?page=${page - 1}&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/notifications?page=${page + 1}&perPage=${perPage}`
					: null,
			last: `${url}/api/notifications?page=${totalPages}&perPage=${perPage}`,
		};

		res.status(200).send({
			status: 200,
			message: "Notifications",
			data: customizedNotifications,
			_meta: _meta,
			_links: _links,
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

exports.updateNotification = async (req, res) => {
	try {
		const notification = await Notification.findByIdAndUpdate(req.params.id, {
			photo_url: req.body.photo_url,
			title_uz: req.body.title_uz,
			title_ru: req.body.title_ru,
			title_en: req.body.title_en,
			content_uz: req.body.content_uz,
			content_ru: req.body.content_ru,
			content_en: req.body.content_en,
		});
		return res.status(200).send({
			status: 200,
			message: "Notification updated",
			data: notification,
		});
	} catch (error) {
		return res.status(400).send(error);
	}
};
