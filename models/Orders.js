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
			card: {
				number: String,
			},
			created_date: {
				type: Date,
				default: Date.now,
			},
			pay_date: {
				type: Date,
			},
			uuid: {
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
		phone: {
			number: {
				type: Number,
				required: true,
			},
			created_at: {
				type: Date,
				default: Date.now,
			},
		},
		delivery: {
			address: {
				longitude: {
					type: Number,
					required: true,
				},
				latitude: {
					type: Number,
					required: true,
				},
			},
			date: {
				from: {
					type: Date,
					required: true,
				},
				to: {
					type: Date,
					required: true,
				},
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
