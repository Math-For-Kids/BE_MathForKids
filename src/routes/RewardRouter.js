const express = require("express");
const rewardController = require("../app/controllers/RewardController");
const rewardMiddleware = require("../app/middlewares/RewardMiddleware");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
// Map multiple file fields
const uploadFields = upload.fields([{ name: "image", maxCount: 1 }]);

// Create reward
router.post("/", uploadFields, rewardController.create);
// Get enabled rewards
router.get("/getEnabledRewards", rewardController.getEnabledRewards);
// Get all rewards
router.get("/", rewardController.getAll);
// Get reward by ID
router.get(
  "/:id",
  rewardMiddleware.checkRewardExistById(),
  rewardController.getById
);
// Update reward
router.patch(
  "/:id",
  rewardMiddleware.checkRewardExistById(),
  uploadFields,
  rewardController.update
);

module.exports = router;
