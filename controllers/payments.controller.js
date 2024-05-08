exports.test = async (req, res) => {
	try {
		console.log(req.body);
		return res.json({
			status: 200,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
