const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
	},
	surname: {
		type: String,
	},
	birthdate: {
		type: Date,
	},
	male: {
		type: Boolean,
		default: false,
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
	isBan: {
		type: Boolean,
		default: false,
	},
});

userSchema.set("timestamps", true);

const Users = mongoose.model("users", userSchema);

module.exports = Users;
