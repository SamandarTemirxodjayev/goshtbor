const {Schema, model, Types} = require("mongoose");
const productSchema = new Schema({
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
	photo_urls: [
		{
			type: String,
			required: true,
		},
	],
	description_uz: {
		type: String,
		required: true,
	},
	description_ru: {
		type: String,
		required: true,
	},
	description_en: {
		type: String,
		required: true,
	},
	weight: {
		type: Number,
		required: true,
	},
	sale: {
		type: Number,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	stock: {
		type: Number,
		required: true,
	},
	category: {
		type: Types.ObjectId,
		ref: "categories",
	},
	brand: {
		type: Types.ObjectId,
		ref: "brands",
	},
});
