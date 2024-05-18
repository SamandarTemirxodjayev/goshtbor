const fs = require("fs");

exports.getOferta = async (req, res) => {
	try {
		fs.readFile("./db/oferta.json", "utf8", (err, data) => {
			if (err) {
				console.error(err);
				return res.status(500).json({error: "Failed to read file"});
			}
			const file = JSON.parse(data);
			return res.json({
				data: file,
				status: "success",
			});
		});
	} catch (error) {
		return res.status(500).json({error});
	}
};
exports.getOfertaHelp = async (req, res) => {
	try {
		fs.readFile("./db/phones.json", "utf8", (err, data) => {
			if (err) {
				console.error(err);
				return res.status(500).json({error: "Failed to read file"});
			}
			const file = JSON.parse(data);
			return res.json({
				data: file,
				status: "success",
			});
		});
	} catch (error) {
		return res.status(500).json({error});
	}
};
exports.putOferta = async (req, res) => {
	try {
		const oferta = req.body;
		fs.writeFile(
			"./db/oferta.json",
			JSON.stringify(oferta, null, 2),
			(writeErr) => {
				if (writeErr) {
					console.error(writeErr);
					return res.status(500).json({error: "Failed to write file"});
				}

				return res.json({
					data: oferta,
					status: "success",
				});
			},
		);
	} catch (error) {
		return res.status(error);
	}
};
exports.putOfertaHelp = async (req, res) => {
	try {
		const oferta = req.body;
		fs.writeFile(
			"./db/phones.json",
			JSON.stringify(oferta, null, 2),
			(writeErr) => {
				if (writeErr) {
					console.error(writeErr);
					return res.status(500).json({error: "Failed to write file"});
				}

				return res.json({
					data: oferta,
					status: "success",
				});
			},
		);
	} catch (error) {
		return res.status(error);
	}
};
