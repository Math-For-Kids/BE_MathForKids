const express = require("express");
const notificationController = require("../app/controllers/NotificationController");
const router = express.Router();


router.post("/", notificationController.create);
router.get("/", notificationController.getAll);
router.get("/:id", notificationController.getById);
router.delete("/:id", notificationController.delete);

module.exports = router;
