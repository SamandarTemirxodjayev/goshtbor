const {Schema, model} = require("mongoose");

const userSchema = new Schema({
	name: {
		type: String,
	},
	surname: {
		type: String,
	},
	photo_url: {
		type: String,
	},
	email: {
		type: String,
	},
	phone: {
		type: String,
	},
	oneSignalId: {
		type: String,
	},
	deviceId: {
		type: String,
	},
	isBan: {
		type: Boolean,
		default: false,
	},
	user_level: {
		type: Number,
		default: 0,
	},
});

userSchema.set("timestamps", true);

const Users = model("users", userSchema);

module.exports = Users;
