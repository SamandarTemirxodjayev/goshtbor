const {Schema, model, Types} = require("mongoose");

const courierSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	surname: {
		type: String,
		required: true,
	},
	photo_url: {
		type: String,
	},
	car: {
		number: {
			type: String,
			required: true,
		},
		model: {
			type: String,
			required: true,
		},
	},
	stars: {
		type: Types.Decimal128,
		default: 5.0,
	},
	phone_number: {
		type: String,
	},
	login: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
});

courierSchema.set("timestamps", true);

const Courier = model("courier", courierSchema);

module.exports = Courier;
