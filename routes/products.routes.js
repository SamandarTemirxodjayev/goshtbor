const {Router} = require("express");
const controller = require("../controllers/products.controller.js");
const adminMiddleware = require("../middleware/admin.middleware.js");

const router = Router();

router.get("/", controller.getProducts);
router.get("/new", controller.getNewProducts);
router.get("/popular", controller.getPopularProducts);
router.post("/", adminMiddleware, controller.createProduct);
router.delete("/:id", adminMiddleware, controller.deleteProduct);
router.put("/:id", adminMiddleware, controller.updateProduct);
router.post("/search", controller.searchProduct);
router.post("/search/byname", controller.searchProductByName);
router.post("/search/bysubcategory", controller.searchProductBySubCategories);

module.exports = router;
