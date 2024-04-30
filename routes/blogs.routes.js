const {Router} = require("express");
const adminMiddleware = require("../middleware/admin.middleware.js");
const controller = require("../controllers/blogs.controller.js");

const router = Router();

router.get("/", controller.getBlogs);
router.post("/", adminMiddleware, controller.createBlogs);
// router.delete("/:id", adminMiddleware, controller.deleteBrand);
// router.put("/:id", adminMiddleware, controller.updateBrand);

module.exports = router;
