const Banners = require("../models/Banners");

exports.getBanners = async (req, res) => {
	try {
		const banners = await Banners.find().populate("brand");
		return res.status(200).json({
			status: 200,
			message: "Banners fetched successfully",
			data: banners,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.createBanner = async (req, res) => {
	try {
		if (req.userId.user_level === 0) {
			return res.status(400).json({
				status: "error",
				message: "You are not authorized to perform this action",
			});
		}
		const banner = new Banners(req.body);
		await banner.save();
		return res.status(200).json({
			status: 200,
			message: "Banner created successfully",
			data: banner,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.updateBanner = async (req, res) => {
	try {
		if (req.userId.user_level === 0) {
			return res.status(400).json({
				status: "error",
				message: "You are not authorized to perform this action",
			});
		}
		const banner = await Banners.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		return res.status(200).json({
			status: 200,
			message: "Banner updated successfully",
			data: banner,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.deleteBanner = async (req, res) => {
	try {
		if (req.userId.user_level === 0) {
			return res.status(400).json({
				status: "error",
				message: "You are not authorized to perform this action",
			});
		}
		const banner = await Banners.findByIdAndDelete(req.params.id);
		return res.status(200).json({
			status: 200,
			message: "Banner deleted successfully",
			data: banner,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
