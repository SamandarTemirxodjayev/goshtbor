exports.sendSMS = async (phone, code) => {
	const data = new URLSearchParams();
	data.append("login", "samandar");
	data.append("password", "gJlv405114TAidbzf9uz");
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
