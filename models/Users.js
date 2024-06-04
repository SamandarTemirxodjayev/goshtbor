const {Schema, model, Types} = require("mongoose");

const userSchema = new Schema({
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
	},
	email: {
		type: String,
	},
	phone: {
		type: String,
	},
	google: {
		token: String,
		code: String,
		id: String,
		email: String,
	},
	apple_id: {
		token: String,
		code: String,
		id: String,
		email: String,
	},
	telegram: {
		id: String,
		auth_date: String,
		hash: String,
	},
	facebook: {
		email: String,
		id: String,
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
	stars: {
		type: Types.Decimal128,
		default: 5,
	},
});

userSchema.set("timestamps", true);

const Users = model("users", userSchema);

module.exports = Users;
