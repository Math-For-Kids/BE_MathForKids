const express = require("express");
const rewardController = require("../app/controllers/RewardController");
const router = express.Router();

router.post("/", rewardController.create);
router.get("/:id", rewardController.getById);
router.get("/",rewardController.getAll);
router.put("/:id",rewardController.update);
router.delete("/:id", rewardController.delete);

module.exports = router;
