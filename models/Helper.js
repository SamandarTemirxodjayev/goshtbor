const {Schema, model} = require("mongoose");

const helperSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	surname: {
		type: String,
		required: true,
	},
	login: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
});

helperSchema.set("timestamps", true);

const Helpers = model("helper", helperSchema);

module.exports = Helpers;
