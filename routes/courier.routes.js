const {Router} = require("express");
const AdminMiddleware = require("../middleware/admin.middleware.js");
const UserMiddleware = require("../middleware/courier.middleware.js");
const controller = require("../controllers/courier.controller.js");

const router = Router();

router.post("/register", AdminMiddleware, controller.createCourier);
router.post("/login", controller.loginCourier);
router.get("/get-me", UserMiddleware, controller.getMe);
router.get("/available-orders", UserMiddleware, controller.getAvailableOrders);
router.get("/received-orders", UserMiddleware, controller.getReceivedOrders);
router.post(
	"/confirm-order/:id",
	UserMiddleware,
	controller.confirmGettingOrder,
);
router.post(
	"/confirm-order-delivery/:id",
	UserMiddleware,
	controller.confirmOrderDelivery,
);
router.post(
	"/end-order-delivery/:id",
	UserMiddleware,
	controller.confirmOrderDeliveryEnd,
);

router.get("/orders-history", UserMiddleware, controller.getOrderHistory);
router.get(
	"/orders-history/:id",
	UserMiddleware,
	controller.getOrderHistoryById,
);
router.post("/edit", UserMiddleware, controller.editProfile);

module.exports = router;
