const Blogs = require("../models/Blogs");

exports.getBlogs = async (req, res) => {
	try {
		const blogs = await Blogs.find();
		return res.json({
			data: blogs,
			status: "success",
		});
	} catch (error) {
		return res.status(500).json(error);
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
		return res.status(500).json(error);
	}
};
