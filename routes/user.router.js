const express = require("express");
const UserMiddleware = require("../middleware/user.middleware.js");
const UserController = require("../controllers/user.contoller.js");
const AdminMiddleware = require("../middleware/admin.middleware.js");

const router = express.Router();

router.get("/getme", UserMiddleware, UserController.getUser);
router.post("/get-me", UserController.postUser);
router.post("/edit", UserMiddleware, UserController.postUserEdit);
router.get("/get-all", AdminMiddleware, UserController.getAllUsers);
router.delete("/:id", AdminMiddleware, UserController.deleteUser);

module.exports = router;
