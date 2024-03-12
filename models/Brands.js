const {Schema, model} = require("mongoose");

const brandSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	photo_url: {
		type: String,
		required: true,
	},
});

brandSchema.set("timestamps", true);

const Brand = model("brands", brandSchema);

module.exports = Brand;
