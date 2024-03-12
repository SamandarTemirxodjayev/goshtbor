const {Router} = require("express");
const adminMiddleware = require("../middleware/admin.middleware.js");
const controller = require("../controllers/brand.controller.js");

const router = Router();

router.get("/", controller.getBrands);
router.post("/", adminMiddleware, controller.createBrand);
router.delete("/:id", adminMiddleware, controller.deleteBrand);
router.patch("/:id", adminMiddleware, controller.updateBrand);

module.exports = router;
