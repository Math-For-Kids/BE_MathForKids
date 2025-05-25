const express = require("express");
const router = express.Router();
const LevelController = require("../app/controllers/LevelController");

router.post("/", LevelController.create);
router.get("/enabled", LevelController.getEnabledLevels);
router.get("/", LevelController.getAll);
router.get("/:id", LevelController.getById);
router.put("/:id", LevelController.update);
// router.delete("/:id", LevelController.delete);

module.exports = router;
