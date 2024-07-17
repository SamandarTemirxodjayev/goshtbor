const OneSignal = require("onesignal-node");

// Create a client instance
const client = new OneSignal.Client({
	userAuthKey: "YTIyZjgxNmUtZTIwZS00NDI4LTg5ZDMtNjA4NmFiMjlmYTc4",
	app: {
		appAuthKey: "MWFjZTgwMTktMTk1Ni00ZTEyLWI1NjItMWUyNTQwYTBjYTI2",
		appId: "fa42a951-2647-4c7a-b1a4-1403203415a6",
	},
});

module.exports = client;
