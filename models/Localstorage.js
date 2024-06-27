const {Schema, model} = require("mongoose");

const localStorageSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	value: {
		type: String,
		required: true,
	},
});

localStorageSchema.set("timestamps", true);

const LocalStorage = model("localstorage", localStorageSchema);

module.exports = LocalStorage;
