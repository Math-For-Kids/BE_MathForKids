const express = require("express");
const ceController = require("../app/controllers/CompletedExerciseController");
const pupilMiddleware = require("../app/middlewares/PupilMiddleware");
const lessonMiddleware = require("../app/middlewares/LessonMiddleware");
const ceMiddleware = require("../app/middlewares/CompletedExerciseMiddleware");
const router = express.Router();

// Create completed exercise
router.post("/", ceController.create);
// Get all completed exercises
router.get("/", ceController.getAll);
// Get completed exercises by pupil ID
router.get(
  "/getByPupil/:pupilId",
  pupilMiddleware.checkPupilExistById("pupilId"),
  ceController.getCompletedExerciseByPupilId
);
// Get completed exercises by lesson ID
router.get(
  "/getByLesson/:lessonId",
  lessonMiddleware.checkLessonExistById("lessonId"),
  ceController.getCompletedExercisesByLesson
);
// Get completed exercise by pupil ID & lesson ID
router.get(
  "/getByPupilAndLesson/:pupilId/lesson/:lessonId",
  pupilMiddleware.checkPupilExistById("pupilId"),
  lessonMiddleware.checkLessonExistById("lessonId"),
  ceController.getCompletedExercisesByPupilIdAndLesson
);
// Get completed exercise by ID
router.get(
  "/:id",
  ceMiddleware.checkCompletedExerciseExistById(),
  ceController.getById
);

module.exports = router;
