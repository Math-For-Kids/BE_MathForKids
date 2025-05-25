const express = require("express");
const rewardController = require("../app/controllers/RewardController");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
// Map multiple file fields
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
]);

router.post("/", uploadFields, rewardController.create);
router.get("/:id", rewardController.getById);
router.get("/", rewardController.getAll);
router.put("/:id", uploadFields, rewardController.update);
// router.put("/disable/:id", rewardController.delete);

module.exports = router;
