const express = require("express");
const generalNotificationController = require("../app/controllers/GeneralNotificationController");
const router = express.Router();

router.post("/", generalNotificationController.create);
router.get("/:id", generalNotificationController.getById);
router.get("/",generalNotificationController.getAll);
router.put("/:id",generalNotificationController.update);
// router.delete("/:id", generalNotificationController.delete);

module.exports = router;
