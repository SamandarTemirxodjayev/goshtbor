const {Router} = require("express");
const adminMiddleware = require("../middleware/admin.middleware.js");
const userMiddleware = require("../middleware/collector.middleware.js");
const controller = require("../controllers/collectors.controller.js");

const router = Router();

router.post("/register", adminMiddleware, controller.createCollector);
router.post("/login", controller.loginCollector);
router.get("/orders", userMiddleware, controller.getAvailableOrders);
router.post("/orders/:id", userMiddleware, controller.submitOrderById);
router.get("/get-me", userMiddleware, controller.getme);
router.post("/edit", userMiddleware, controller.editProfile);
router.post("/batch", userMiddleware, controller.createBatch);
router.get("/batch", userMiddleware, controller.getBatches);

module.exports = router;
