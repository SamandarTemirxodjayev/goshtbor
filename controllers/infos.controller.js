const fs = require("fs");

exports.getInfo = async (req, res) => {
	try {
		fs.readFile("./db/infos.json", "utf8", (err, data) => {
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
exports.putInfo = async (req, res) => {
	try {
		fs.writeFile(
			"./db/infos.json",
			JSON.stringify(req.body, null, 2),
			(writeErr) => {
				if (writeErr) {
					console.error(writeErr);
					return res.status(500).json({error: "Failed to write file"});
				}

				return res.json({
					data: req.body,
					status: "success",
				});
			},
		);
	} catch (error) {
		return res.status(500).json({error});
	}
};
exports.getPhone = async (req, res) => {
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
exports.putPhone = async (req, res) => {
	try {
		fs.writeFile(
			"./db/phones.json",
			JSON.stringify(req.body, null, 2),
			(writeErr) => {
				if (writeErr) {
					console.error(writeErr);
					return res.status(500).json({error: "Failed to write file"});
				}

				return res.json({
					data: req.body,
					status: "success",
				});
			},
		);
	} catch (error) {
		return res.status(500).json({error});
	}
};
