exports.getUser = async (req, res) => {
	try {
		return res.status(200).json(req.userId);
	} catch (error) {
		return res.status(500).send(error);
	}
};
exports.postUserEdit = async (req, res) => {
	try {
		if (req.body.name) {
			req.userId.name = req.body.name;
		}
		if (req.body.surname) {
			req.userId.surname = req.body.surname;
		}
		if (req.body.birthdate) {
			req.userId.birthdate = req.body.birthdate;
		}
		if (req.body.male) {
			req.userId.male = req.body.male;
		}
		if (req.body.photo_url) {
			req.userId.photo_url = req.body.photo_url;
		}
		await req.userId.save();
		return res.status(200).json({
			status: "success",
			message: "User updated",
			data: req.userId,
		});
	} catch (error) {
		return res.status(500).send(error);
	}
};
