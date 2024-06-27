const {Schema, model, Types} = require("mongoose");

const preOrderSchema = new Schema({
	helperId: {
		type: Types.ObjectId,
		required: true,
	},
	userId: {
		type: String,
		default: null,
	},
	name: {
		type: String,
		required: true,
	},
	surname: {
		type: String,
		required: true,
	},
	phone_number: {
		type: Number,
		required: true,
	},
	products: [
		{
			product: {
				type: Types.ObjectId,
				ref: "products",
			},
			quantity: Number,
		},
	],
	pay: {
		type: {
			type: String,
			default: null,
		},
		url: {
			type: String,
			default: null,
		},
	},
	delivery: {
		address: {
			longitude: {
				type: Number,
				default: null,
			},
			latitude: {
				type: Number,
				default: null,
			},
			name: {
				type: String,
				default: null,
			},
		},
		date: {
			from: {
				type: Date,
				default: null,
			},
			to: {
				type: Date,
				default: null,
			},
			end: {
				type: Date,
				default: null,
			},
		},
		comment: {
			type: String,
			default: "",
		},
	},
});

preOrderSchema.set("timestamps", true);

const PreOrders = model("preorder", preOrderSchema);

module.exports = PreOrders;
