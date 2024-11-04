const {Router} = require("express");
const adminMiddleware = require("../middleware/admin.middleware.js");
const controller = require("../controllers/oferta.controller.js");

const router = Router();

router.get("/", controller.getOferta);
router.put("/", adminMiddleware, controller.putOferta);
router.get("/help", controller.getOfertaHelp);
router.put("/help", adminMiddleware, controller.putOfertaHelp);

module.exports = router;
