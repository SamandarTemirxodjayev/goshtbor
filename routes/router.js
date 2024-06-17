const {Router} = require("express");
const routerRegister = require("./register.routes.js");
const routerUser = require("./user.routes.js");
const routerCategory = require("./category.routes.js");
const routerLogin = require("./login.routes.js");
const routerNotification = require("./notification.routes.js");
const routerBanner = require("./banners.routes.js");
const routerBrand = require("./brand.routes.js");
const routerProducts = require("./products.routes.js");
const routerOrders = require("./orders.routes.js");
const routerOferta = require("./oferta.routes.js");
const routerBlogs = require("./blogs.routes.js");
const routerInfos = require("./infos.routes.js");
const routerPayments = require("./payments.routes.js");
const routerSubCategory = require("./subcategory.routes.js");
const routerCourier = require("./courier.routes.js");
const routerCollector = require("./collector.routes.js");
const routerHelper = require("./helper.routes.js");
const router = Router();

router.use("/register", routerRegister);
router.use("/user", routerUser);
router.use("/category", routerCategory);
router.use("/login", routerLogin);
router.use("/notification", routerNotification);
router.use("/banners", routerBanner);
router.use("/brands", routerBrand);
router.use("/products", routerProducts);
router.use("/orders", routerOrders);
router.use("/oferta", routerOferta);
router.use("/blogs", routerBlogs);
router.use("/infos", routerInfos);
router.use("/payments", routerPayments);
router.use("/subcategory", routerSubCategory);
router.use("/courier", routerCourier);
router.use("/collectors", routerCollector);
router.use("/helper", routerHelper);

module.exports = router;
