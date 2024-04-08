const OneSignal = require("onesignal-node");

const client = new OneSignal.Client(
	"7bb12952-573d-4341-afbf-3b451928b008",
	"NDY0NjIxMTctNmJjMy00NDg1LTg1ZTctOGNhZWE3NjcwYjdk",
);

module.exports = client;
