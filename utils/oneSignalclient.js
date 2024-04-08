const OneSignal = require("onesignal-node");

const client = new OneSignal.Client(
	"fa42a951-2647-4c7a-b1a4-1403203415a6",
	"MWFjZTgwMTktMTk1Ni00ZTEyLWI1NjItMWUyNTQwYTBjYTI2",
);

module.exports = client;
