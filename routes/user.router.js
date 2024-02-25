const express = require("express");
const UserMiddleware = require("../middleware/user.middleware.js");
const UserController = require("../controllers/user.contoller.js");

const router = express.Router();

router.get("/", UserMiddleware, UserController.getUser);
router.post("/edit", UserMiddleware, UserController.postUserEdit);

module.exports = router;
