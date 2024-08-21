const OneSignal = require("@onesignal/node-onesignal");

const configuration = OneSignal.createConfiguration({
	userAuthKey: "YTIyZjgxNmUtZTIwZS00NDI4LTg5ZDMtNjA4NmFiMjlmYTc4",
	restApiKey: "MWFjZTgwMTktMTk1Ni00ZTEyLWI1NjItMWUyNTQwYTBjYTI2",
});

const client = new OneSignal.DefaultApi(configuration);

const notification = new OneSignal.Notification();

exports.sendNotification = async (heading, content) => {
	notification.app_id = "fa42a951-2647-4c7a-b1a4-1403203415a6";
	notification.name = "test_notification_name";
	notification.contents = {
		en: content,
	};

	// required for Huawei
	notification.headings = {
		en: heading,
	};

	notification.included_segments = ["Active Subscriptions"];

	const notificationResponse = await client.createNotification(notification);

	console.log("notificationResponse", notificationResponse);
};
