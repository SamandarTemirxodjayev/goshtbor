const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller.js");
const userMiddleware = require("../middleware/user.middleware.js");
const adminMiddleware = require("../middleware/admin.middleware.js");

router.get("/", categoryController.getAllCategories);
router.post("/", adminMiddleware, categoryController.createCategory);
router.delete("/:id", adminMiddleware, categoryController.deleteCategory);
router.patch("/:id", adminMiddleware, categoryController.updateCategory);

module.exports = router;
