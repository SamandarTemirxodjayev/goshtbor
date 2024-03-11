const express = require("express");
const routerRegister = require("./register.router");
const routerUser = require("./user.router");
const routerCategory = require("./category.router");
const routerLogin = require("./login.router");
const routerNotification = require("./notification.router");
const routerBanner = require("./banners.router")
const router = express.Router();

router.use("/register", routerRegister);
router.use("/user", routerUser);
router.use("/category", routerCategory);
router.use("/login", routerLogin);
router.use("/notification", routerNotification);
router.use("/banners", routerBanner);

module.exports = router;
