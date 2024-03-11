const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller.js");
const userMiddleware = require("../middleware/user.middleware.js");

router.get("/", categoryController.getAllCategories);
router.post("/", userMiddleware, categoryController.createCategory);
router.delete("/:id", userMiddleware, categoryController.deleteCategory);
router.patch("/:id", userMiddleware, categoryController.updateCategory);

module.exports = router;
