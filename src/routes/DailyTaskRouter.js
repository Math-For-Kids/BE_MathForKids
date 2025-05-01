const express = require("express");
const router = express.Router();
const DailyTaskController = require("../app/controllers/DailyTaskController");

router.post("/", DailyTaskController.create);
router.get("/", DailyTaskController.getAll);
router.get("/exercise/:exerciseId", DailyTaskController.getByExercise);
router.get("/:id", DailyTaskController.getById);
router.put("/:id", DailyTaskController.update);
router.delete("/:id", DailyTaskController.delete);

module.exports = router;
