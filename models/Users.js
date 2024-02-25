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
	},
	photo_url: {
		type: String,
	},
	data: {
		type: String,
		required: true,
	},
	isBan: {
		type: Boolean,
		default: false,
	},
});

userSchema.set("timestamps", true);

const Users = mongoose.model("users", userSchema);

module.exports = Users;
