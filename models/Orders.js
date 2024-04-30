const {Schema, model, Types} = require("mongoose");

const orderSchema = new Schema(
	{
		userId: {
			type: Types.ObjectId,
			required: true,
			ref: "users",
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
		status: {
			type: Number,
			default: 0,
		},
		pay: {
			type: {
				type: String,
			},
			created_date: {
				type: Date,
				default: Date.now,
			},
			pay_date: {
				type: Date,
			},
			id: {
				type: String,
			},
			status: {
				type: String,
				default: "created",
			},
		},
		comment: {
			type: String,
		},
		delivery: {
			address: {
				longitude: {
					type: Number,
				},
				latitude: {
					type: Number,
				},
				name: {
					type: String,
				},
			},
			date: {
				type: Date,
				required: true,
			},
			courier: {
				type: Types.ObjectId,
			},
		},
	},
	{
		timestamps: true,
	},
);

const Orders = model("orders", orderSchema);

module.exports = Orders;
