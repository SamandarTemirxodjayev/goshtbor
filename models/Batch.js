const {Schema, model, Types} = require("mongoose");
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const batchSchema = new Schema({
	collectorId: {
		type: Types.ObjectId,
		required: true,
		ref: "collector",
	},
	batchId: {
		type: String,
		default: null,
	},
	sender: {
		type: String,
		default: null,
	},
	date: {
		created_date: {
			type: Date,
			default: Date.now(),
		},
		finished_date: {
			type: Date,
			default: null,
		},
	},
	products: [
		{
			_id: {
				type: Types.ObjectId,
				ref: "products",
			},
			quantity: {
				type: Number,
				default: null,
			},
			amount: {
				type: Number,
				default: null,
			},
		},
	],
	status: {
		type: Number,
		default: 1,
	},
});

batchSchema.plugin(AutoIncrement, {inc_field: "batch_id", start_seq: 1});
batchSchema.set("timestamps", true);

const Batch = model("batch", batchSchema);

module.exports = Batch;
