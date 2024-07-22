const {default: mongoose} = require("mongoose");
const Courier = require("../models/Courier");
const Orders = require("../models/Orders");

exports.getOrders = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		let products = await Orders.find()
			.populate("userId")
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
			.populate("delivery.courier")
			.populate("collector.collector_id")
			.skip(skip)
			.limit(perPage);

		const totalItems = await Orders.countDocuments();
		const totalPages = Math.ceil(totalItems / perPage);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/admin/orders?page=${page}&perPage=${perPage}`,
			first: `${url}/api/admin/orders?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/admin/orders?page=${page - 1}&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/admin/orders?page=${page + 1}&perPage=${perPage}`
					: null,
			last: `${url}/api/admin/orders?page=${totalPages}&perPage=${perPage}`,
		};

		return res.status(200).json({
			message: "Products fetched successfully!",
			data: products,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.getOrderById = async (req, res) => {
	try {
		let order = await Orders.findById(req.params.id)
			.populate("userId")
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
			.populate("collector.collector_id")
			.populate("delivery.courier");
		if (!order) {
			return res.status(404).json({
				message: "Order not found",
				data: null,
			});
		}

		return res.status(200).json({
			message: "Products fetched successfully!",
			data: order,
			_meta: null,
			_links: null,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.getOrderByOrderId = async (req, res) => {
	try {
		let order = await Orders.findOne({
			order_id: parseInt(req.params.order_id),
		})
			.populate("userId")
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
      .populate("collector.collector_id")
			.populate("delivery.courier");
		if (!order) {
			return res.status(404).json({
				message: "Order not found",
				data: null,
			});
		}

		return res.status(200).json({
			message: "Products fetched successfully!",
			data: order,
			_meta: null,
			_links: null,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.getOrderByPeriod = async (req, res) => {
	try {
		const {from, to} = req.body;
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		if (!from || !to) {
			return res
				.status(400)
				.json({message: "Both from and to dates are required"});
		}
		const fromDate = new Date(from).toISOString();
		const toDate = new Date(to).toISOString();

		let orders = await Orders.find({
			createdAt: {
				$gte: fromDate,
				$lte: toDate,
			},
		})
			.populate("userId")
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
      .populate("collector.collector_id")
			.populate("delivery.courier")
			.skip(skip)
			.limit(perPage);
		const totalItems = await Orders.countDocuments();
		const totalPages = Math.ceil(totalItems / perPage);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/admin/orders/filter/bydate?page=${page}&perPage=${perPage}`,
			first: `${url}/api/admin/orders/filter/bydate?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/admin/orders/filter/bydate?page=${
							page - 1
					  }&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/admin/orders/filter/bydate?page=${
							page + 1
					  }&perPage=${perPage}`
					: null,
			last: `${url}/api/admin/orders/filter/bydate?page=${totalPages}&perPage=${perPage}`,
		};
		return res.status(200).json({
			message: "Products fetched successfully!",
			data: orders,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.getOrderByPhoneNumber = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		let order = await Orders.find({
			"phone.number": req.body.phone.number,
		})
			.populate("userId")
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
      .populate("collector.collector_id")
			.populate("delivery.courier")
			.skip(skip)
			.limit(perPage);

		const totalItems = await Orders.countDocuments();
		const totalPages = Math.ceil(totalItems / perPage);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/admin/orders/filter/byphone?page=${page}&perPage=${perPage}`,
			first: `${url}/api/admin/orders/filter/byphone?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/admin/orders/filter/byphone?page=${
							page - 1
					  }&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/admin/orders/filter/byphone?page=${
							page + 1
					  }&perPage=${perPage}`
					: null,
			last: `${url}/api/admin/orders/filter/byphone?page=${totalPages}&perPage=${perPage}`,
		};

		return res.status(200).json({
			message: "Products fetched successfully!",
			data: order,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.createCourier = async (req, res) => {
	try {
		const newCourier = await Courier.create(req.body);
		await newCourier.save();
		return res.status(200).json({
			message: "Courier created",
			data: newCourier,
			_meta: null,
			_links: null,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.deleteCourier = async (req, res) => {
	try {
		await Courier.findByIdAndDelete(req.params.id);
		return res.status(200).json({
			message: "Courier deleted",
			data: null,
			_meta: null,
			_links: null,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.updateCourier = async (req, res) => {
	try {
		const updatedCourier = await Courier.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			},
		);

		if (!updatedCourier) {
			return res.status(404).json({message: "Courier not found"});
		}

		return res.status(200).json({
			message: "Courier updated successfully",
			data: updatedCourier,
			_meta: null,
			_links: null,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.getCourierById = async (req, res) => {
	try {
		const courier = await Courier.findById(req.params.id);
		return res.json({
			status: "success",
			data: courier,
			_meta: null,
		});
	} catch (error) {
		return res.status500().json({message: error.message});
	}
};
exports.getCouriers = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		let couriers = await Courier.find().skip(skip).limit(perPage);

		const totalItems = await Courier.countDocuments();
		const totalPages = Math.ceil(totalItems / perPage);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/admin/create/courier?page=${page}&perPage=${perPage}`,
			first: `${url}/api/admin/create/courier?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/admin/create/courier?page=${
							page - 1
					  }&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/admin/create/courier?page=${
							page + 1
					  }&perPage=${perPage}`
					: null,
			last: `${url}/api/admin/create/courier?page=${totalPages}&perPage=${perPage}`,
		};

		return res.status(200).json({
			message: "Couriers fetched successfully!",
			data: couriers,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status500().json({message: error.message});
	}
};
exports.getCouriersOrders = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		let orders = await Orders.find({
			"delivery.collector_id": new mongoose.Types.ObjectId(req.params.id),
		})
			.populate("userId")
			.populate({
				path: "products.product",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			})
			.populate("delivery.courier")
			.skip(skip)
			.limit(perPage);

		const totalItems = await Orders.countDocuments();
		const totalPages = Math.ceil(totalItems / perPage);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/admin/orders/courier/${req.params.id}?page=${page}&perPage=${perPage}`,
			first: `${url}/api/admin/orders/courier/${req.params.id}?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/admin/orders/courier/${req.params.id}?page=${
							page - 1
					  }&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/admin/orders/courier/${req.params.id}?page=${
							page + 1
					  }&perPage=${perPage}`
					: null,
			last: `${url}/api/admin/orders/courier/${req.params.id}?page=${totalPages}&perPage=${perPage}`,
		};

		return res.status(200).json({
			message: "Orders fetched successfully!",
			data: orders,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status500().json({message: error.message});
	}
};
