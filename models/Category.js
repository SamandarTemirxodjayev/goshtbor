const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
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

const Category = mongoose.model("categories", categorySchema);

module.exports = Category;
