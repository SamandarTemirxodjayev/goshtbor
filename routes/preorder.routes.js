const {Router} = require("express");
const controller = require("../controllers/preorders.controller.js");
const UserMiddleware = require("../middleware/helper.middleware.js");

const router = Router();

router.post("/", UserMiddleware, controller.createPreOrderByHelper);

module.exports = router;
