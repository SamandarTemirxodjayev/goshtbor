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
	description_photo: {
		type: String,
	},
	weight: {
		type: Number,
		required: true,
	},
	sale: {
		isSale: {
			type: Boolean,
			default: false,
		},
		discount: {
			type: Number,
		},
		price: {
			type: Number,
		},
	},
	price: {
		type: Number,
		required: true,
	},
	stock: {
		type: Boolean,
		default: true,
	},
	category: {
		type: Types.ObjectId,
		ref: "categories",
	},
	brand: {
		type: Types.ObjectId,
		ref: "brands",
	},
	saleds: {
		type: Number,
		default: 0,
	},
	stars: {
		type: Number,
		default: 0,
	},
});

productSchema.set("timestamps", true);

const Products = model("products", productSchema);

module.exports = Products;
