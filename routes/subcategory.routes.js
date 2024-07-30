const express = require("express");
const router = express.Router();
const controller = require("../controllers/subcategory.controller.js");
const adminMiddleware = require("../middleware/admin.middleware.js");

router.get("/", controller.getAllSubCategories);
router.post("/", adminMiddleware, controller.createSubCategory);
router.delete("/:id", adminMiddleware, controller.deleteSubCategory);
router.put("/:id", adminMiddleware, controller.updateSubCategory);
router.get("/category/:id", controller.getSubcatgoriesByCategoryId);
router.post("/products", controller.getSubCategoriesProducts);

module.exports = router;
