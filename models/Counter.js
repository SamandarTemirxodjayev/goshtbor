const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
	model: {type: String, required: true},
	field: {type: String, required: true},
	count: {type: Number, default: 0},
});

const Counter = mongoose.model("my_counter", counterSchema);

module.exports = Counter;
