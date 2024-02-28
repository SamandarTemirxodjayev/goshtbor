const mongoose = require("mongoose");

const filesSchema = new mongoose.Schema({
	user: {
		type: String,
	},
	fileName: {
		type: String,
	},
	fileId: {
		type: String,
	},
	fileUrl: {
		type: String,
	},
});
filesSchema.set("timestamps", true);

const Files = mongoose.model("files", filesSchema);

module.exports = Files;
