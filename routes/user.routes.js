const express = require("express");
const UserMiddleware = require("../middleware/user.middleware.js");
const UserController = require("../controllers/user.contoller.js");
const AdminMiddleware = require("../middleware/admin.middleware.js");

const router = express.Router();

router.get("/getme", UserMiddleware, UserController.getUser);
router.get("/", UserMiddleware, UserController.getFullUserInformation);
router.post("/get-me", UserController.postUser);
router.post("/edit", UserMiddleware, UserController.postUserEdit);
router.post("/edit/data", UserMiddleware, UserController.postUserEditPhone);
router.post(
	"/edit/data/:uuid",
	UserMiddleware,
	UserController.postUserEditPhoneUUID,
);
router.get("/get-all", AdminMiddleware, UserController.getAllUsers);
router.delete("/", UserMiddleware, UserController.deleteUserProfile);
router.delete("/:id", AdminMiddleware, UserController.deleteUser);

router.post("/locations", UserMiddleware, UserController.addLocation);
router.put("/locations/:id", UserMiddleware, UserController.editLocation);
router.delete("/locations/:id", UserMiddleware, UserController.deleteLocation);

module.exports = router;
