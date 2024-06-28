const PreOrders = require("../models/Preorders.js");
const {stripos} = require("../utils/funtions.js");
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const Products = require("../models/Products.js");
const LocalStorage = require("../models/Localstorage.js");
const Orders = require("../models/Orders.js");
const Users = require("../models/Users.js");
require("dotenv").config();

const token = process.env.BOT_TOKEN;

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
			const productDetails = `- ${product.name_uz} (${product.brand.name}), ${
				product.category.name_uz
			}, ${
				item.product.sale.isSale ? item.product.sale.price : item.product.price
			} so'm (${item.quantity} ta)\n`;
			productList += productDetails;
			totalPrice +=
				(item.product.sale.isSale
					? item.product.sale.price
					: item.product.price) * item.quantity;
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
Umumiy narx: ${totalPrice} so'm

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
	if (text == "Mening Buyurtmalarim") {
		const user = await Users.findOne({
			"telegram.id": chatId,
		});
		const orders = await Orders.find({
			userId: new mongoose.Types.ObjectId(user._id),
		});
		console.log(orders);
		bot.sendMessage(chatId, "Buyurtmalaringiz");
	}
});

bot.on("location", async (msg) => {
	const chatId = msg.chat.id;
	const userStorage = await LocalStorage.findOne({name: chatId});

	if (userStorage && stripos(userStorage.value, "location||")) {
		console.log(msg.location);
		const id = userStorage.value.split("||")[1];
		const preorder = await PreOrders.findById(new mongoose.Types.ObjectId(id));

		if (!preorder) {
			await bot.sendMessage(
				chatId,
				"Buyurtma topilmadi. Iltimos, yana urinib ko'ring.",
			);
			return;
		}

		preorder.delivery.address.latitude = msg.location.latitude;
		preorder.delivery.address.longitude = msg.location.latitude;
		await preorder.save();
		await userStorage.deleteOne();

		let user = await Users.findOne({"telegram.id": chatId});
		if (!user) {
			user = await Users.create({
				name: preorder.name,
				surname: preorder.surname,
				telegram: {id: chatId},
			});
			await user.save();
		}

		const newOrder = await Orders.create({
			userId: user._id,
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

		const uzumUrl =
			"https://www.apelsin.uz/open-service?serviceId=498616071&order_id=" +
			newOrder.order_id;

		let totalAmount = 0;
		for (const product of newOrder.products) {
			const productDoc = await Products.findById(product.product);
			if (!productDoc) {
				await bot.sendMessage(
					chatId,
					"Mahsulot topilmadi. Iltimos, yana urinib ko'ring.",
				);
				return;
			}
			const price = productDoc.sale.isSale
				? productDoc.sale.price
				: productDoc.price;
			const subtotal = price * product.quantity;
			totalAmount += subtotal;
		}

		const stringToEncode = `m=663b1ac0fe41a3907df8f595;ac.order_id=${
			newOrder.order_id
		};a=${totalAmount * 100}`;
		const base64EncodedString = Buffer.from(stringToEncode).toString("base64");
		const paymeUrl = "https://checkout.paycom.uz/" + base64EncodedString;
		const clickUrl = `https://my.click.uz/services/pay?service_id=33923&merchant_id=25959&amount=${totalAmount}&transaction_param=${newOrder.order_id}`;

		await newOrder.save();
		await preorder.deleteOne();

		await bot.sendMessage(chatId, "Joylashuvingiz qabul qilindi", {
			reply_markup: {
				resize_keyboard: true,
				keyboard: [[{text: "Mening Buyurtmalarim"}]],
			},
		});

		await bot.sendMessage(chatId, "To'lovni Amalga oshiring", {
			reply_markup: {
				resize_keyboard: true,
				inline_keyboard: [
					[
						{text: "Uzum", url: uzumUrl},
						{text: "Payme", url: paymeUrl},
					],
					[{text: "Click", url: clickUrl}],
				],
			},
		});
	}
});
