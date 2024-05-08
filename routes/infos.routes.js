const {Router} = require("express");
const AdminController = require("../middleware/admin.middleware.js");
const controller = require("../controllers/infos.controller.js");

const router = Router();

router.get("/order", controller.getInfo);
router.put("/order", AdminController, controller.putInfo);
router.get("/phone", controller.getPhone);
router.put("/phone", AdminController, controller.putPhone);

module.exports = router;
