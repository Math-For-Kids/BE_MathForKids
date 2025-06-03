const express = require("express");
const completedLessonController = require("../app/controllers/CompletedLessonController");
const router = express.Router();

router.post("/", completedLessonController.create);
// router.get("/", completedLessonController.getAll);
router.get("/getByLessonId/:lessonId", completedLessonController.getByLessonId);
router.get("/getCompletedLessonByPupil/:id", completedLessonController.getCompletedLessonByPupil);
router.get("/getCompletedLessonByPupilLesson/:pupilId/lesson/:lessonId", completedLessonController.getCompletedLessonByPupilLesson);

router.get("/:id", completedLessonController.getById);
router.put("/:id", completedLessonController.update);
// router.delete("/:id", completedLessonController.delete);

module.exports = router;
