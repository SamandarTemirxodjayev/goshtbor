const {Schema, model} = require("mongoose");

const adminsSchema = new Schema({
	name: {
		type: String,
		default: "Mehmon",
	},
	surname: {
		type: String,
		default: "Foydalanuvchi",
	},
	photo_url: {
		type: String,
		default: null,
	},
	login: {
		type: String,
		unique: true,
	},
	password: {
		type: String,
	},
});

adminsSchema.set("timestamps", true);

const Admins = model("admins", adminsSchema);

module.exports = Admins;
