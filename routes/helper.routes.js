const {Router} = require("express");
const adminMiddleware = require("../middleware/admin.middleware.js");
const userMiddleware = require("../middleware/helper.middleware.js");
const controller = require("../controllers/helper.controller.js");

const router = Router();

router.post("/register", adminMiddleware, controller.registerHelper);
router.post("/login", controller.loginHelper);
router.get("/active-orders", userMiddleware, controller.getActiveOrders);
router.get("/get-me", userMiddleware, controller.getme);
router.post("/edit", userMiddleware, controller.editProfile);
router.post("/cancel-order/:id", userMiddleware, controller.cancelOrder);
router.post(
	"/order/search",
	userMiddleware,
	controller.searchOrderByIdOrByPhone,
);

module.exports = router;
