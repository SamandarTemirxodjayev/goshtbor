const SubCategory = require("../models/SubCategory");
const dotenv = require("dotenv");

dotenv.config();

exports.getAllSubCategories = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const perPage = parseInt(req.query.perPage) || 10;

		const totalCount = await SubCategory.countDocuments();
		const totalPages = Math.ceil(totalCount / perPage);

		const subcategories = await SubCategory.find()
			.skip((page - 1) * perPage)
			.limit(perPage);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalCount,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/subcategory?page=${page}&perPage=${perPage}`,
			first: `${url}/api/subcategory?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/subcategory?page=${page - 1}&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/subcategory?page=${page + 1}&perPage=${perPage}`
					: null,
			last: `${url}/api/subcategory?page=${totalPages}&perPage=${perPage}`,
		};

		return res.json({
			status: "success",
			data: subcategories,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.createSubCategory = async (req, res) => {
	try {
		const subcategories = new SubCategory(req.body);
		await subcategories.save();
		return res.json({status: "success", data: subcategories});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.deleteSubCategory = async (req, res) => {
	try {
		await SubCategory.findByIdAndDelete(req.params.id);
		return res.json({status: "success"});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.updateSubCategory = async (req, res) => {
	try {
		const category = await SubCategory.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
			},
		);
		return res.status(200).json({
			status: 200,
			message: "Kategoriya Muvaffaqiyatli Yangilandi",
			data: category,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
