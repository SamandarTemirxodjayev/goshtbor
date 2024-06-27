const PreOrders = require("../models/Preorders.js");
const {stripos} = require("../utils/funtions.js");
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const Products = require("../models/Products.js");
const LocalStorage = require("../models/Localstorage.js");
const Orders = require("../models/Orders.js");
require("dotenv").config();

const token = "7496758951:AAHPGeexlNH8meAV8G8AKHxE7HDr-bQFL4g";

const bot = new TelegramBot(token, {polling: true});

function isValidObjectId(id) {
	return (
		mongoose.Types.ObjectId.isValid(id) &&
		new mongoose.Types.ObjectId(id).toString() === id
	);
}

bot.on("message", async (msg) => {
	const text = msg.text;
	const chatId = msg.chat.id;
	if (stripos(text, "/start ")) {
		const _id = text.split(" ")[1];
		if (!isValidObjectId(_id)) {
			return await bot.sendMessage(chatId, "Buyurtma Topilmadi");
		}

		const preorder = await PreOrders.findById(_id).populate({
			path: "products.product",
			populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
		});
		if (!preorder) {
			return await bot.sendMessage(chatId, "Buyurtma Topilmadi");
		}
		preorder.userId = chatId;
		await preorder.save();

		let productList = "";
		let totalPrice = 0;

		preorder.products.forEach((item) => {
			const product = item.product;
			const productDetails = `- ${product.name_uz} (${product.brand.name}), ${product.category.name_uz}, ${item.product.price} UZS\n`;
			productList += productDetails;
			totalPrice += item.product.price;
		});

		const create = await LocalStorage.create({
			name: chatId,
			value: `location||${preorder._id}`,
		});
		await create.save();

		const message = `
Qabul qiluvchi: ${preorder.name} ${preorder.surname}
Telefon raqami: ${preorder.phone_number}
Mahsulotlar:
${productList}
Umumiy narx: ${totalPrice} UZS

Yetkaziladigan Manzilni Yuboring`;

		await bot.sendMessage(chatId, message.trim(), {
			parse_mode: "HTML",
			reply_markup: {
				resize_keyboard: true,
				keyboard: [
					[
						{
							text: "Joylashuvni Yuborish",
							request_location: true,
						},
					],
				],
			},
		});
	}
});

bot.on("location", async (msg) => {
	const chatId = msg.chat.id;
	const userStorage = await LocalStorage.findOne({
		name: chatId,
	});
	if (userStorage && stripos(userStorage.value, "location||")) {
		const {latitude, longitude} = msg.location;
		const id = userStorage.value.split("||")[1];
		const preorder = await PreOrders.findById(new mongoose.Types.ObjectId(id));
		preorder.delivery.address.longitude = longitude;
		preorder.delivery.address.latitude = latitude;
		await preorder.save();
		await userStorage.deleteOne();
		const newOrder = await Orders.create({
			delivery: {
				date: preorder.delivery.date,
				address: {
					longitude: preorder.delivery.address.longitude,
					latitude: preorder.delivery.address.latitude,
					name: preorder.delivery.address.name,
				},
			},
			"phone.number": preorder.phone_number,
			products: preorder.products,
			comment: preorder.delivery.comment || "",
		});
		await newOrder.save();
		await bot.sendMessage(
			chatId,
			`
			Joylashuvingiz qabul qilindi
To'lovni Amalga oshiring`,
			{
				reply_markup: {
					resize_keyboard: true,
					inline_keyboard: [
						[
							{
								text: "Joylashuvni Yuborish",
								url: "",
							},
						],
					],
				},
			},
		);
	}
});
