const {Schema, model} = require("mongoose");

const categorySchema = new Schema({
	name_uz: {
		type: String,
		required: true,
	},
	name_ru: {
		type: String,
		required: true,
	},
	name_en: {
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
