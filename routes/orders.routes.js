const {Router} = require("express");
const userMiddleware = require("../middleware/user.middleware.js");
const controller = require("../controllers/orders.controller.js");

const router = Router();

router.get("/", userMiddleware, controller.getAllOrders);

module.exports = router;
