const express = require("express");
const rewardController = require("../app/controllers/RewardController");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.array("image", 1), rewardController.create);
router.get("/:id", rewardController.getById);
router.get("/", rewardController.getAll);
router.put("/:id", upload.array("image", 1), rewardController.update);
router.put("/disable/:id", rewardController.delete);

module.exports = router;
