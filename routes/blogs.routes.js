const {Router} = require("express");
const adminMiddleware = require("../middleware/admin.middleware.js");
const controller = require("../controllers/blogs.controller.js");

const router = Router();

router.get("/", controller.getBlogs);
router.get("/:id", controller.getBlogById);
router.post("/", adminMiddleware, controller.createBlogs);
router.put("/:id", adminMiddleware, adminMiddleware, controller.updateBlog);
router.delete("/:id", adminMiddleware, controller.deleteBlog);

module.exports = router;
