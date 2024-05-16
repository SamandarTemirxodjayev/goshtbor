const {Schema, model, Types} = require("mongoose");

const bannerSchema = new Schema({
	photo_url: {
		type: String,
		required: true,
	},
	brand: {
		type: Types.ObjectId,
		ref: "brands",
	},
	title_uz: {
		type: String,
		required: true,
	},
	title_ru: {
		type: String,
		required: true,
	},
	title_en: {
		type: String,
		required: true,
	},
	discount: {
		type: Number,
		required: true,
	},
	background_color: {
		type: String,
		required: true,
	},
	sub_background_color: {
		type: String,
		required: true,
	},
	discount_background_color: {
		type: String,
		required: true,
	},
	connect_item: {
		category: {
			type: Types.ObjectId,
			ref: "categories",
		},
		product: {
			type: Types.ObjectId,
			ref: "products",
		},
	},
});

bannerSchema.set("timestamps", true);

const Banners = model("banners", bannerSchema);

module.exports = Banners;
