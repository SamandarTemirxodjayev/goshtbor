const {Schema, model, Types} = require("mongoose");

const messageSchema = new Schema({
	user: {
		type: Types.ObjectId,
		ref: "users",
		required: true,
	},
	is_admin: {
		type: Boolean,
		default: false,
		required: true,
	},
	admin: {
		type: Types.ObjectId,
		ref: "helper",
	},
	message: {
		type: String,
		required: true,
	},
});

messageSchema.set("timestamps", true);

const Messages = model("messages", messageSchema);

module.exports = Messages;
