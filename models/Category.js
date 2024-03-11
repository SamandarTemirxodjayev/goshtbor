const {Schema, model} = require("mongoose");

const categorySchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	photo_url: {
		type: String,
		required: true,
	},
});

categorySchema.set("timestamps", true);

const Category = model("categories", categorySchema);

module.exports = Category;
