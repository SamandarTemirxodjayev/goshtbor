require("dotenv").config();

exports.sendSMS = async (phone, code) => {
	const data = new URLSearchParams();
	data.append("login", process.env.SMS_LOGIN);
	data.append("password", process.env.SMS_PASSWORD);
	if (typeof nickname !== "undefined") {
		data.append("nickname", nickname);
	}
	const sms = [
		{
			phone,
			text: `Shu kodni hech kimga aytmang! Uni faqat firibgarlar so'raydi! Nikomu ne soobshayte etot kod! Ego Sprashivayut tol'ko moshenniki!\n\n Tasdiqash uchun kod: ${code}`,
		},
	];
	data.append("data", JSON.stringify(sms));

	fetch("http://185.8.212.184/smsgateway/", {
		method: "POST",
		body: data,
	})
		.catch((err) => console.error(err))
		.then((res) => console.log(res));
};
exports.sendSMSUrl = async (phone, name, _id) => {
	const data = new URLSearchParams();
	data.append("login", process.env.SMS_LOGIN);
	data.append("password", process.env.SMS_PASSWORD);
	if (typeof nickname !== "undefined") {
		data.append("nickname", nickname);
	}
	const sms = [
		{
			phone,
			text: `Assalomu Alaykum ${name}. Goshtbor tizimida buyurtmangizni to'lov qilish uchun quyidagi havola orqali o'ting\n\n https://t.me/gosht_bor_bot?start=${_id}`,
		},
	];
	data.append("data", JSON.stringify(sms));

	fetch("http://185.8.212.184/smsgateway/", {
		method: "POST",
		body: data,
	})
		.catch((err) => console.error(err))
		.then((res) => console.log(res));
};
