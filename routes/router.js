const express = require("express");
const routerRegister = require("./register.router");
const routerUser = require("./user.router");
const routerCategory = require("./category.router");
const router = express.Router();

router.use("/register", routerRegister);
router.use("/user", routerUser);
router.use("/category", routerCategory);

module.exports = router;
