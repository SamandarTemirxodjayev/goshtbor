const {Router} = require("express");
const controller = require("../controllers/banners.controller.js");
const userMiddleware = require("../middleware/user.middleware.js");

const router = Router();

router.get("/", controller.getBanners);
router.post("/", userMiddleware, controller.createBanner);
router.put("/:id", userMiddleware, controller.updateBanner);
router.delete("/:id", userMiddleware, controller.deleteBanner);

module.exports = router;
