exports.sendSMS = async (phone, text) => {
	const data = new URLSearchParams();
	data.append("login", "samandar");
	data.append("password", "gJlv405114TAidbzf9uz");
	if (typeof nickname !== "undefined") {
		data.append("nickname", nickname);
	}
	const sms = [
		{
			phone,
			text,
		},
	];
	data.append("data", JSON.stringify(sms));

	fetch("http://185.8.212.184/smsgateway/", {
		method: "POST",
		body: data,
		headers: {
			"User-Agent": "Opera 10.00",
		},
		timeout: 5000,
	})
		.then((response) => response.text())
		.then((text) => console.log(text))
		.catch((err) => console.error(err));
};
