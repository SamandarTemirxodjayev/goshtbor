const {Router} = require("express");
const userMiddleware = require("../middleware/user.middleware.js");
const controller = require("../controllers/orders.controller.js");

const router = Router();

router.get("/", userMiddleware, controller.getAllOrders);
router.post("/create", userMiddleware, controller.createOrder);
router.put("/create/:uuid", controller.orderConfirmByCard);
router.post("/code", userMiddleware, controller.confirmationCode);
router.put("/code/:uuid", userMiddleware, controller.confirmationCodeUUID)

module.exports = router;
