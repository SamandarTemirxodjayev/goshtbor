const {Schema, model, Types} = require("mongoose");

const orderSchema = new Schema({
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
			uuid: {
				type: String,
				default: null,
			},
			card_pan: {
				type: String,
				default: null,
			},
			payment_amount: {
				type: Number,
				default: null,
			},
			amount: {
				type: Number,
				default: null,
			},
			total_amount: {
				type: Number,
				default: null,
			},
			commission_amount: {
				type: Number,
				default: null,
			},
		},
		payme: {
			id: {
				type: Types.ObjectId,
				default: null,
			},
			amount: {
				type: Number,
				default: null,
			},
			total_amount: {
				type: Number,
				default: null,
			},
			create_time: {
				type: Number,
				default: null,
			},
			perform_time: {
				type: Number,
				default: 0,
			},
			cancel_time: {
				type: Number,
				default: 0,
			},
			state: {
				type: Number,
				default: 1,
			},
			reason: {
				type: Number,
				default: null,
			},
		},
		click: {
			click_trans_id: {
				type: String,
				default: null,
			},
			service_id: {
				type: Number,
				default: null,
			},
			click_paydoc_id: {
				type: String,
				default: null,
			},
			merchant_trans_id: {
				type: Types.ObjectId,
				default: null,
			},
			merchant_prepare_id: {
				type: Number,
				default: null,
			},
			merchant_confirm_id: {
				type: Number,
				default: null,
			},
			amount: {
				type: Number,
				default: null,
			},
			total_amount: {
				type: Number,
				default: null,
			},
			action: {
				type: Number,
				default: 0,
			},
		},
		uzum: {
			serviceId: {
				type: Number,
				default: null,
			},
			transId: {
				type: String,
				default: null,
			},
			amount: {
				type: Number,
				default: null,
			},
			total_amount: {
				type: Number,
				default: null,
			},
			paymentSource: {
				type: String,
				default: null,
			},
			tariff: {
				type: String,
				default: null,
			},
			confirmTime: {
				type: Number,
				default: null,
			},
			reverseTime: {
				type: Number,
				default: null,
			},
			status: {
				type: String,
				default: "CREATED",
			},
		},
		created_date: {
			type: Date,
			default: Date.now,
		},
		pay_date: {
			type: Date,
			default: null,
		},
		uuid: {
			type: String,
			default: null,
		},
		status: {
			type: String,
			default: "created",
		},
		order_url: {
			type: String,
		},
	},
	comment: {
		type: String,
		default: null,
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
			name: {
				type: String,
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
			end: {
				type: Date,
			},
		},
		courier: {
			type: Types.ObjectId,
			default: null,
			ref: "courier",
		},
		stars: {
			type: Number,
			default: 0,
		},
	},
});
orderSchema.set("timestamps", true);
const Orders = model("orders", orderSchema);

module.exports = Orders;
