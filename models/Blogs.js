const {Schema, model} = require("mongoose");

const blogsSchema = new Schema({
	photo_url: {
		type: String,
		required: true,
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
	content_uz: {
		type: String,
		required: true,
	},
	content_ru: {
		type: String,
		required: true,
	},
	content_en: {
		type: String,
		required: true,
	},
});

blogsSchema.set("timestamps", true);

const Blogs = model("blogs", blogsSchema);

module.exports = Blogs;
