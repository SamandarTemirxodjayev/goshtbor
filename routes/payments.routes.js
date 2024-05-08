const {Router} = require("express");
const controller = require("../controllers/payments.controller.js");

const router = Router();

router.post("/payme", controller.test);

module.exports = router;
