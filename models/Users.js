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
		default: null,
	},
	birth_date: {
		type: Date,
		default: null,
	},
	email: {
		type: String,
		default: null,
	},
	phone: {
		type: String,
		default: null,
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
		default: null,
	},
	deviceId: {
		type: String,
		default: null,
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
	locations: [
		{
			longitude: {
				type: Number,
				required: true,
			},
			latitude: {
				type: Number,
				required: true,
			},
			name: {
				type: String,
				required: true,
			},
			podyezd: {
				type: String,
			},
			qavat: {
				type: String,
			},
			kvartira: {
				type: String,
			},
			dkod: {
				type: String,
			},
			comment: {
				type: String,
			},
		},
	],
	cards: [
		{
			card_pan: {
				type: String,
			},
			card_token: {
				type: String,
			},
			phone: {
				type: String,
			},
			holder_name: {
				type: String,
			},
			ps: {
				type: String,
			},
			status: {
				type: String,
			},
		},
	],
});

userSchema.set("timestamps", true);

const Users = model("users", userSchema);

module.exports = Users;
