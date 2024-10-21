const {default: mongoose} = require("mongoose");
const Courier = require("../models/Courier");
const Orders = require("../models/Orders");
const Collectors = require("../models/Collectors");
const {createHash, compare} = require("../utils/codeHash");
const Helpers = require("../models/Helper");
const fs = require("fs");
const Batch = require("../models/Batch");
const Products = require("../models/Products");
const Admins = require("../models/Admins");
const {createToken} = require("../utils/token");

exports.register = async (req, res) => {
	try {
		let {password, ...result} = req.body;
		password = await createHash(password);
		const newAdmin = await Admins.create({
			...result,
			password,
		});
		return res.status(200).json({
			message: "Products fetched successfully!",
			data: newAdmin,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.login = async (req, res) => {
	try {
		const {password, login} = req.body;
		const admin = await Admins.findOne({login});
		if (!admin) {
			return res.status(400).json({
				message: "User not found",
				data: null,
			});
		}
		const isMatch = await compare(password.toString(), admin.password);
		if (!isMatch) {
			return res.status(400).json({
				status: "error",
				message: "Kod Xato",
			});
		}
		const token = await createToken(admin._id);

		return res.json({
			status: 200,
			message: "Tasdiqlandi",
			data: {
				auth_token: token,
				token_type: "bearer",
				createdAt: new Date(),
				expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
				admin,
			},
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.getme = async (req, res) => {
	try {
		return res.json({
			status: "success",
			data: req.userId,
			message: "Success",
		});
	} catch (error) {
		return res.status(500).json({error});
	}
};
exports.editUserProfile = async (req, res) => {
	try {
		const admin = await Admins.findByIdAndUpdate(req.userId._id, req.body, {
			new: true,
		});
		return res.json({
			status: "success",
			data: admin,
		});
	} catch (error) {
		return res.status(500).json({error});
	}
};
exports.changeAdminPassword = async (req, res) => {
	try {
		let {password} = req.body;
		let admin = await Admins.findById(req.userId._id);
		password = await createHash(password);
		admin.password = password;
		await admin.save();
		return res.json({
			status: "success",
			data: admin,
		});
	} catch (error) {
		return res.status(500).json({error});
	}
};
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
		return res.status(500).json({message: error.message});
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
		return res.status(500).json({message: error.message});
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
		return res.status(500).json({message: error.message});
	}
};
exports.createCollector = async (req, res) => {
	try {
		let hashedCode = await createHash(req.body.password.toString());
		const collector = await Collectors.create({
			name: req.body.name,
			surname: req.body.surname,
			login: req.body.login,
			password: hashedCode,
		});
		await collector.save();
		return res.status(200).json({
			message: "Collector created",
			data: collector,
			_meta: null,
			_links: null,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.getCollectors = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		let collectors = await Collectors.find().skip(skip).limit(perPage);

		const totalItems = await Collectors.countDocuments();
		const totalPages = Math.ceil(totalItems / perPage);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/admin/create/collectors?page=${page}&perPage=${perPage}`,
			first: `${url}/api/admin/create/collectors?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/admin/create/collectors?page=${
							page - 1
					  }&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/admin/create/collectors?page=${
							page + 1
					  }&perPage=${perPage}`
					: null,
			last: `${url}/api/admin/create/collectors?page=${totalPages}&perPage=${perPage}`,
		};

		return res.status(200).json({
			message: "Collectors fetched successfully!",
			data: collectors,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.deleteCollector = async (req, res) => {
	try {
		await Collectors.findByIdAndDelete(
			new mongoose.Types.ObjectId(req.params.id),
		);
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
exports.updateCollector = async (req, res) => {
	try {
		const updatedCollector = await Collectors.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			},
		);

		if (!updatedCollector) {
			return res.status(404).json({message: "Collector not found"});
		}

		return res.status(200).json({
			message: "Collector updated successfully",
			data: updatedCollector,
			_meta: null,
			_links: null,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.getCollectorById = async (req, res) => {
	try {
		const collector = await Collectors.findOne(
			new mongoose.Types.ObjectId(req.params.id),
		);
		return res.status(200).json({
			message: "Collector updated successfully",
			data: collector,
			_meta: null,
			_links: null,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.getCollectorOrders = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		let orders = await Orders.find({
			"collector.collector_id": new mongoose.Types.ObjectId(req.params.id),
		})
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
			self: `${url}/api/admin/orders/collector/${req.params.id}?page=${page}&perPage=${perPage}`,
			first: `${url}/api/admin/orders/collector/${req.params.id}?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/admin/orders/collector/${req.params.id}?page=${
							page - 1
					  }&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/admin/orders/collector/${req.params.id}?page=${
							page + 1
					  }&perPage=${perPage}`
					: null,
			last: `${url}/api/admin/orders/collector/${req.params.id}?page=${totalPages}&perPage=${perPage}`,
		};

		return res.status(200).json({
			message: "Collectors fetched successfully!",
			data: orders,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.createHelper = async (req, res) => {
	try {
		let hashedCode = await createHash(req.body.password.toString());
		const collector = await Helpers.create({
			name: req.body.name,
			surname: req.body.surname,
			login: req.body.login,
			password: hashedCode,
		});
		await collector.save();
		return res.status(200).json({
			message: "Collector created",
			data: collector,
			_meta: null,
			_links: null,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.updateHelper = async (req, res) => {
	try {
		const updatedHelper = await Helpers.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			},
		);

		if (!updatedHelper) {
			return res.status(404).json({message: "Helper not found"});
		}

		return res.status(200).json({
			message: "Helper updated successfully",
			data: updatedHelper,
			_meta: null,
			_links: null,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.getHelperById = async (req, res) => {
	try {
		const helper = await Helpers.findById(
			new mongoose.Types.ObjectId(req.params.id),
		);
		return res.status(200).json({
			message: "Helper",
			data: helper,
			_meta: null,
			_links: null,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.getAllHelpers = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const perPage = parseInt(req.query.perPage, 10) || 10;
		const skip = (page - 1) * perPage;

		let helpers = await Helpers.find().skip(skip).limit(perPage);

		const totalItems = await Helpers.countDocuments();
		const totalPages = Math.ceil(totalItems / perPage);

		const url = process.env.URL || "http://localhost:3000";
		const _meta = {
			currentPage: page,
			perPage: perPage,
			totalCount: totalItems,
			totalPages: totalPages,
		};

		const _links = {
			self: `${url}/api/admin/create/helpers?page=${page}&perPage=${perPage}`,
			first: `${url}/api/admin/create/helpers?page=1&perPage=${perPage}`,
			prev:
				page > 1
					? `${url}/api/admin/create/helpers?page=${
							page - 1
					  }&perPage=${perPage}`
					: null,
			next:
				page < totalPages
					? `${url}/api/admin/create/helpers?page=${
							page + 1
					  }&perPage=${perPage}`
					: null,
			last: `${url}/api/admin/create/helpers?page=${totalPages}&perPage=${perPage}`,
		};

		return res.status(200).json({
			message: "Helpers fetched successfully!",
			data: helpers,
			_meta: _meta,
			_links: _links,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.deleteHelper = async (req, res) => {
	try {
		await Helpers.findByIdAndDelete(new mongoose.Types.ObjectId(req.params.id));
		return res.status(200).json({
			message: "Helpers deleted successfully!",
			data: null,
			_meta: null,
			_links: null,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.notWorkingPageEdit = async (req, res) => {
	try {
		const notworking = req.body;
		fs.writeFile(
			"./db/notworking.json",
			JSON.stringify(notworking, null, 2),
			(writeErr) => {
				if (writeErr) {
					console.error(writeErr);
					return res.status(500).json({error: "Failed to write file"});
				}

				return res.json({
					data: notworking,
					status: "success",
				});
			},
		);
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.getInformationAboutOrders = async (req, res) => {
	try {
		const fromDate = new Date(req.body.from);
		const toDate = new Date(req.body.to);

		const result = await Orders.aggregate([
			{
				$match: {
					createdAt: {
						$gte: fromDate,
						$lte: toDate,
					},
				},
			},
			{
				$group: {
					_id: null,
					totalOrders: {$sum: 1},
					totalCardAmount: {$sum: "$pay.card.total_amount"},
					totalPaymeAmount: {$sum: "$pay.payme.total_amount"},
					totalClickAmount: {$sum: "$pay.click.total_amount"},
					totalUzumAmount: {$sum: "$pay.uzum.total_amount"},
					statusCounts: {
						$push: {
							status: "$status",
						},
					},
				},
			},
			{
				$project: {
					_id: 0,
					totalOrders: 1,
					totalAmount: {
						$add: [
							"$totalCardAmount",
							"$totalPaymeAmount",
							"$totalClickAmount",
							"$totalUzumAmount",
						],
					},
					statusCounts: 1,
				},
			},
		]);

		// Calculate the status counts from the result
		const statusCounts =
			result[0]?.statusCounts.reduce((acc, cur) => {
				acc[cur.status] = (acc[cur.status] || 0) + 1;
				return acc;
			}, {}) || {};

		const totalOrders = result[0]?.totalOrders || 0;
		const totalAmount = result[0]?.totalAmount || 0;

		return res.json({
			data: {
				total_orders: totalOrders,
				total_amount: totalAmount,
				status_counts: statusCounts,
			},
			status: "success",
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.getBatchesByStatus = async (req, res) => {
	try {
		const batches = await Batch.find({
			status: parseInt(req.query.status),
		})
			.populate("products._id")
			.populate("collectorId")
			.populate({
				path: "products._id",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			});
		return res.json({
			status: "success",
			data: batches,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({message: error.message});
	}
};
exports.cancelBatchById = async (req, res) => {
	try {
		const batch = await Batch.findById(req.params.id)
			.populate("products._id")
			.populate("collectorId")
			.populate({
				path: "products._id",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			});
		if (batch.status != 1) {
			return res.status(400).json({
				message: "Invalid",
				data: null,
			});
		}
		batch.status = -1;
		batch.date.finished_date = new Date();
		await batch.save();
		return res.json({
			status: "success",
			data: batch,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.confirmBatchById = async (req, res) => {
	try {
		const batch = await Batch.findById(req.params.id)
			.populate("products._id")
			.populate("collectorId")
			.populate({
				path: "products._id",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			});
		if (batch.status != 1) {
			return res.status(400).json({
				message: "Invalid",
				data: null,
			});
		}
		batch.status = 2;
		batch.date.finished_date = new Date();
		await batch.save();
		for (const product of batch.products) {
			const productDoc = await Products.findById(product._id._id);
			productDoc.quantity += product.quantity;
			productDoc.stock = true;
			productDoc.initial_price = product.amount;
			await productDoc.save();
		}
		return res.json({
			status: "success",
			data: batch,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
exports.getBatchesById = async (req, res) => {
	try {
		const batches = await Batch.findById(
			new mongoose.Types.ObjectId(req.params.id),
		)
			.populate("products._id")
			.populate("collectorId")
			.populate({
				path: "products._id",
				populate: [{path: "brand"}, {path: "category"}, {path: "subcategory"}],
			});
		return res.json({
			status: "success",
			data: batches,
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
