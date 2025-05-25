const express = require("express");
const router = express.Router();
const UserNotificationController = require("../app/controllers/UserNotificationController");

router.post("/", UserNotificationController.create);
router.get("/", UserNotificationController.getAll);
router.get("/user/:userId", UserNotificationController.getByUserId);
router.get("/:id", UserNotificationController.getById);
router.put("/:id", UserNotificationController.update);
router.delete("/:id", UserNotificationController.delete);

module.exports = router;
