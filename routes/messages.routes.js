const {Router} = require("express");
const controller = require("../controllers/messages.controller.js");
const UserMiddleware = require("../middleware/user.middleware.js");
const HelperMiddleware = require("../middleware/helper.middleware.js");

const router = Router();

router.get("/", UserMiddleware, controller.getUserMessages);
router.get("/chats", HelperMiddleware, controller.getChats);
router.get("/:id", HelperMiddleware, controller.getUserMessagesById);
router.post("/user", UserMiddleware, controller.saveMessageUser);
router.post("/admin", HelperMiddleware, controller.saveMessageAdmin);

module.exports = router;
