const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
	photo_url: {
		type: String,
		required: true,
	},
	brand: {
		type: mongoose.Schema.Types.ObjectId,
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
});

bannerSchema.set("timestamps", true);

const Banners = mongoose.model("banners", bannerSchema);

module.exports = Banners;
