const {Schema, model, Types} = require("mongoose");

const messageSchema = new Schema({
	user: {
		type: Types.ObjectId,
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
	is_user_message: {
		type: Boolean,
		required: true,
		default: false,
	},
});

messageSchema.set("timestamps", true);

const Messages = model("messages", messageSchema);

module.exports = Messages;
