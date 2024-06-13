const {Schema, model} = require("mongoose");

const collectorSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	surname: {
		type: String,
		required: true,
	},
	login: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
});

collectorSchema.set("timestamps", true);

const Collectors = model("collector", collectorSchema);

module.exports = Collectors;
