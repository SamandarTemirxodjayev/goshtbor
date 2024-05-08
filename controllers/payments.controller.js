exports.test = async (req, res) => {
	try {
		console.log(req.body);
		return res.json({
			jsonrpc: "2.0",
			result: true,
			id: req.body.id,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
