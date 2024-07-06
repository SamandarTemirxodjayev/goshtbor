const Banners = require("../models/Banners");
const dotenv = require("dotenv");
const filterByLang = require("../utils/filters");

dotenv.config();

exports.getBanners = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const perPage = parseInt(req.query.perPage) || 10;

		const totalCount = await Banners.countDocuments();
		const totalPages = Math.ceil(totalCount / perPage);

		let banners = await Banners.find()
			.skip((page - 1) * perPage)
			.limit(perPage)
			.populate("brand")
			.populate("connect_item.category")
			.populate("connect_item.product");

		banners = filterByLang(
			banners,
			req.query._l,
			"title",
			"connect_item.category.name",
			"connect_item.product.name",
		);
		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalCount,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/banners?page=${page}&perPage=${perPage}&_l=${req.query._l}`,
			first: `${url}/api/banners?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/banners?page=${page - 1}&perPage=${perPage}&_l=${
							req.query._l
					  }`
					: null,
			next:
				page < totalPages
					? `${url}/api/banners?page=${page + 1}&perPage=${perPage}`
					: null,
			last: `${url}/api/banners?page=${totalPages}&perPage=${perPage}`,
		};

		return res.status(200).json({
			status: 200,
			message: "Banners fetched successfully",
			data: banners,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.createBanner = async (req, res) => {
	try {
		if (!req.body.photo_url) {
			return res.status(400).json({
				status: "error",
				message: "Please provide photo_url",
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
