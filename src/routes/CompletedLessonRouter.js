const express = require("express");
const CompletedLessonController = require("../app/controllers/CompletedLessonController");
const router = express.Router();

router.post("/", CompletedLessonController.create);
router.get("/", CompletedLessonController.getAll);
router.get("/getByExerciseId/:id", CompletedLessonController.getByLessonId);
router.get("/:id", CompletedLessonController.getById);
router.put("/:id", CompletedLessonController.update);
router.delete("/:id", CompletedLessonController.delete);

module.exports = router;
