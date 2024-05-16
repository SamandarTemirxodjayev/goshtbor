const {Schema, model, Types} = require("mongoose");

const subCategorySchema = new Schema({
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
	category: {
		type: Types.ObjectId,
		required: true,
	},
});

subCategorySchema.set("timestamps", true);

const SubCategory = model("subcategories", subCategorySchema);

module.exports = SubCategory;
