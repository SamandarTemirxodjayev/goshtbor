const {Router} = require("express");
const userMiddleware = require("../middleware/user.middleware.js");
const controller = require("../controllers/notification.controller.js");
const router = Router();

router.post("/", userMiddleware, controller.createNotification);
router.get("/", userMiddleware, controller.getNotifications);
router.post("/:id/read", userMiddleware, controller.markNotificationAsRead);
router.post("/readall", userMiddleware, controller.markAsReadAllNotifications);
router.delete("/:id", userMiddleware, controller.deleteNotification);
router.patch("/:id", userMiddleware, controller.upadateNotification);

module.exports = router;
