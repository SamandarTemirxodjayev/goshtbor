const express = require("express");
const UserMiddleware = require("../middleware/user.middleware.js");
const UserController = require("../controllers/user.contoller.js");

const router = express.Router();

router.get("/getme", UserMiddleware, UserController.getUser);
router.post("/get-me", UserController.postUser);
router.post("/edit", UserMiddleware, UserController.postUserEdit);

module.exports = router;
