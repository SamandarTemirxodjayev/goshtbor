const mongoose = require("mongoose");

const confirmSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true,
	},
	uuid: {
		type: String,
		required: true,
	},
	code: {
		type: String,
		required: true,
	},
	data: {
		type: String,
		required: true,
	},
	expiredAt: {
		type: Date,
		required: true,
	},
});

confirmSchema.set("timestamps", true);

confirmSchema.statics.checkAndDeleteExpired = async function (uuid) {
	const confirmation = await this.findOne({uuid});

	if (!confirmation) {
		return {expired: true};
	}

	if (confirmation.expiredAt < new Date()) {
		console.log("Confirmation is expired.");
		await this.findByIdAndDelete(confirmation._id);
		console.log("Deleted confirmation.");
		return {expired: true};
	}

	console.log("Confirmation is not expired.");
	return {expired: false, confirmation: confirmation};
};

const Confirmations = mongoose.model("confirmations", confirmSchema);

module.exports = Confirmations;
