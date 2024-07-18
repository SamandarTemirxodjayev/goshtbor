const {Schema, model, Types} = require("mongoose");
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

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
			url: {
				type: String,
				required: true,
			},
			id: {
				type: String,
				required: true,
			},
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
		default: null,
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
			default: null,
		},
		price: {
			type: Number,
			default: null,
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
		required: true,
	},
	subcategory: {
		type: Types.ObjectId,
		ref: "subcategories",
		required: true,
	},
	brand: {
		type: Types.ObjectId,
		ref: "brands",
		required: true,
	},
	saleds: {
		type: Number,
		default: 0,
	},
	stars: {
		type: Number,
		default: 0,
	},
	MXIK: {
		code: {
			type: String,
			required: true,
		},
		package_code: {
			type: String,
			required: true,
		},
	},
});

productSchema.set("timestamps", true);
productSchema.plugin(AutoIncrement, {inc_field: "product_id", start_seq: 1});

productSchema.statics.searchByName = async function (name) {
	return this.model("products")
		.find({
			$or: [
				{name_uz: {$regex: name, $options: "i"}}, // Case-insensitive search
				{name_ru: {$regex: name, $options: "i"}},
				{name_en: {$regex: name, $options: "i"}},
			],
		})
		.populate("brand")
		.populate("category")
		.populate("subcategory");
};
productSchema.statics.searchByNameOrProductId = async function (nameOrId) {
	return this.find({
		$or: [
			{name_uz: {$regex: nameOrId, $options: "i"}},
			{name_ru: {$regex: nameOrId, $options: "i"}},
			{name_en: {$regex: nameOrId, $options: "i"}},
			{product_id: nameOrId},
		],
	})
		.populate("brand")
		.populate("category")
		.populate("subcategory");
};

const Products = model("products", productSchema);

module.exports = Products;
