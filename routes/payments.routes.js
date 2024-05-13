const {Router} = require("express");
const controller = require("../controllers/payments.controller.js");
const paymeMiddleware = require("../middleware/payme.middleware.js");

const router = Router();

router.post("/payme", controller.test);

module.exports = router;
