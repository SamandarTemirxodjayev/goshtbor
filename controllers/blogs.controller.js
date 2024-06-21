const Blogs = require("../models/Blogs");
const dotenv = require("dotenv");

dotenv.config();

exports.getBlogs = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const perPage = parseInt(req.query.perPage) || 10;

		const totalCount = await Blogs.countDocuments();
		const totalPages = Math.ceil(totalCount / perPage);

		const blogs = await Blogs.find()
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
			self: `${url}/api/blogs?page=${page}&perPage=${perPage}`,
			first: `${url}/api/blogs?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/blogs?page=${page - 1}&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/blogs?page=${page + 1}&perPage=${perPage}`
					: null,
			last: `${url}/api/blogs?page=${totalPages}&perPage=${perPage}`,
		};

		// Send the response with pagination info
		return res.status(200).json({
			message: "Blogs fetched successfully!",
			data: blogs,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.createBlogs = async (req, res) => {
	const {
		photo_url,
		title_uz,
		title_ru,
		title_en,
		description_uz,
		description_ru,
		description_en,
		content_uz,
		content_ru,
		content_en,
	} = req.body;

	if (!photo_url) return res.status(400).json({error: "photo_url is required"});
	if (!title_uz) return res.status(400).json({error: "title_uz is required"});
	if (!title_ru) return res.status(400).json({error: "title_ru is required"});
	if (!title_en) return res.status(400).json({error: "title_en is required"});
	if (!description_uz)
		return res.status(400).json({error: "description_uz is required"});
	if (!description_ru)
		return res.status(400).json({error: "description_ru is required"});
	if (!description_en)
		return res.status(400).json({error: "description_en is required"});
	if (!content_uz)
		return res.status(400).json({error: "content_uz is required"});
	if (!content_ru)
		return res.status(400).json({error: "content_ru is required"});
	if (!content_en)
		return res.status(400).json({error: "content_en is required"});

	try {
		const newBlog = new Blogs({
			photo_url,
			title_uz,
			title_ru,
			title_en,
			description_en,
			description_ru,
			description_uz,
			content_en,
			content_ru,
			content_uz,
		});
		await newBlog.save();
		return res.json({
			data: newBlog,
			status: "success",
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.getBlogById = async (req, res) => {
	try {
		const blog = await Blogs.findById(req.params.id);
		if (!blog) return res.status(404).json({message: "Blog not found"});
		return res.json({data: blog, status: "success"});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.updateBlog = async (req, res) => {
	try {
		const blog = await Blogs.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!blog) return res.status(404).json({message: "Blog not found"});
		return res.json({data: blog, status: "success"});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};

exports.deleteBlog = async (req, res) => {
	try {
		const blog = await Blogs.findByIdAndDelete(req.params.id);
		if (!blog) return res.status(404).json({message: "Blog not found"});
		return res.json({message: "Blog deleted successfully", status: "success"});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
