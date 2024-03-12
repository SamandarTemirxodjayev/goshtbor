const {Router} = require("express");
const controller = require("../controllers/banners.controller.js");
const userMiddleware = require("../middleware/user.middleware.js");
const adminMiddleware = require("../middleware/admin.middleware.js");

const router = Router();

router.get("/", controller.getBanners);
router.post("/", adminMiddleware, controller.createBanner);
router.put("/:id", adminMiddleware, controller.updateBanner);
router.delete("/:id", adminMiddleware, controller.deleteBanner);

module.exports = router;
