const {Router} = require("express");
const adminMiddleware = require("../middleware/admin.middleware.js");
const controller = require("../controllers/admin.controller.js");

const router = Router();

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

module.exports = router;
