const {Router} = require("express");
const routerRegister = require("./register.router.js");
const routerUser = require("./user.router.js");
const routerCategory = require("./category.router.js");
const routerLogin = require("./login.router.js");
const routerNotification = require("./notification.router.js");
const routerBanner = require("./banners.router.js");
const routerBrand = require("./brand.router.js");
const router = Router();

router.use("/register", routerRegister);
router.use("/user", routerUser);
router.use("/category", routerCategory);
router.use("/login", routerLogin);
router.use("/notification", routerNotification);
router.use("/banners", routerBanner);
router.use("/brands", routerBrand);

module.exports = router;
