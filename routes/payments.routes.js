const {Router} = require("express");
const controller = require("../controllers/payments.controller.js");

const router = Router();

router.post("/payme", controller.paymeHandler);
router.post("/click/getinfo", controller.clickGetInfo);
router.post("/click/prepare", controller.clickPrepare);
router.post("/click/complete", controller.clickComplete);

module.exports = router;
