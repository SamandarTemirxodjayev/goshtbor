const express = require("express");
const RegisterController = require("../controllers/register.controller.js");

let router = express.Router();

router.post("/", RegisterController.postRegister);
router.post("/:uuid", RegisterController.postUUIDConfirm);

module.exports = router;
