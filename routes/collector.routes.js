const {Router} = require("express");
const adminMiddleware = require("../middleware/admin.middleware.js");
const userMiddleware = require("../middleware/collector.middleware.js");
const controller = require("../controllers/collectors.controller.js");

const router = Router();

router.post("/register", adminMiddleware, controller.createCollector);
router.post("/login", controller.loginCollector);
router.get("/orders", userMiddleware, controller.getAvailableOrders);

module.exports = router;
