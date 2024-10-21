const {Router} = require("express");
const adminMiddleware = require("../middleware/admin.middleware.js");
const controller = require("../controllers/admin.controller.js");

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", adminMiddleware, controller.getme);
router.post("/profile", adminMiddleware, controller.editUserProfile);
router.post(
	"/change-password",
	adminMiddleware,
	controller.changeAdminPassword,
);

router.get("/orders", adminMiddleware, controller.getOrders);
router.get("/orders/:id", adminMiddleware, controller.getOrderById);
router.patch(
	"/orders/:order_id",
	adminMiddleware,
	controller.getOrderByOrderId,
);
router.post(
	"/orders/filter/bydate",
	adminMiddleware,
	controller.getOrderByPeriod,
);
router.post(
	"/orders/filter/byphone",
	adminMiddleware,
	controller.getOrderByPhoneNumber,
);
router.post("/create/courier", adminMiddleware, controller.createCourier);
router.delete("/create/courier/:id", adminMiddleware, controller.deleteCourier);
router.patch("/create/courier/:id", adminMiddleware, controller.updateCourier);
router.get("/create/courier/:id", adminMiddleware, controller.getCourierById);
router.get("/create/courier", adminMiddleware, controller.getCouriers);
router.get(
	"/orders/courier/:id",
	adminMiddleware,
	controller.getCouriersOrders,
);
router.post("/create/collector", adminMiddleware, controller.createCollector);
router.delete(
	"/create/collector/:id",
	adminMiddleware,
	controller.deleteCollector,
);
router.patch(
	"/create/collector/:id",
	adminMiddleware,
	controller.updateCollector,
);
router.get(
	"/create/collector/:id",
	adminMiddleware,
	controller.getCollectorById,
);
router.get("/create/collectors", adminMiddleware, controller.getCollectors);
router.get(
	"/orders/collector/:id",
	adminMiddleware,
	controller.getCollectorOrders,
);

router.post("/create/helper", adminMiddleware, controller.createHelper);
router.delete("/create/helper/:id", adminMiddleware, controller.deleteHelper);
router.patch("/create/helper/:id", adminMiddleware, controller.updateHelper);
router.get("/create/helper/:id", adminMiddleware, controller.getHelperById);
router.get("/create/helpers", adminMiddleware, controller.getAllHelpers);
router.post("/not-working", adminMiddleware, controller.notWorkingPageEdit);
router.post(
	"/results/orders",
	adminMiddleware,
	controller.getInformationAboutOrders,
);
router.get("/batches", adminMiddleware, controller.getBatchesByStatus);
router.get("/batch/:id", adminMiddleware, controller.getBatchesById);
router.delete("/batches/:id", adminMiddleware, controller.cancelBatchById);
router.put("/batches/:id", adminMiddleware, controller.confirmBatchById);
module.exports = router;
