const {Router} = require("express");
const controller = require("../controllers/payments.controller.js");
const UzumMiddleware = require("../middleware/uzum.middleware.js");

const router = Router();

router.post("/payme", controller.paymeHandler);
router.post("/click/getinfo", controller.clickGetInfo);
router.post("/click/prepare", controller.clickPrepare);
router.post("/click/complete", controller.clickComplete);

router.post("/uzum/check", UzumMiddleware, controller.uzumCheck);
router.post("/uzum/create", UzumMiddleware, controller.uzumCreate);
router.post("/uzum/confirm", UzumMiddleware, controller.uzumConfirm);
router.post("/uzum/reverse", UzumMiddleware, controller.uzumReverse);
router.post("/uzum/status", UzumMiddleware, controller.uzumStatus);

module.exports = router;
