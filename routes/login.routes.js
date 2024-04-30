const controllerLogin = require("../controllers/login.controller.js");
const express = require("express");
const router = express.Router();

router.post("/", controllerLogin.login);
router.post("/:uuid", controllerLogin.postUUIDConfirm);

module.exports = router;
