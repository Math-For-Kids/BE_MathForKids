const express = require("express");
const levelController = require("../app/controllers/LevelController");
const levelMiddleware = require("../app/middlewares/LevelMiddleware");
const router = express.Router();

// Create level
router.post("/", levelController.create);
// Get all levels
router.get("/", levelController.getAll);
// Get enabled levels
router.get("/getEnabledLevels", levelController.getEnabledLevels);
// Get level by ID
router.get(
  "/:id",
  levelMiddleware.checkLevelExistById(),
  levelController.getById
);
// Update level
router.patch(
  "/:id",
  levelMiddleware.checkLevelExistById(),
  levelController.update
);

module.exports = router;
