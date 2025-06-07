const express = require("express");
const ceController = require("../app/controllers/CompletedExerciseController");
const pupilMiddleware = require("../app/middlewares/PupilMiddleware");
const lessonMiddleware = require("../app/middlewares/LessonMiddleware");
const ceMiddleware = require("../app/middlewares/CompletedExerciseMiddleware");
const router = express.Router();

// Create completed exercise
router.post("/", ceController.create);
// Get completed exercise by ID
router.get(
  "/:id",
  ceMiddleware.checkCompletedExerciseExistById(),
  ceController.getById
);
// Get all paginated completed exercises
router.get("/getAll", ceController.getAll);

// Filter paginated completed exercise by pupilID
router.get(
  "/filterByPupilID/:pupilID",
  pupilMiddleware.checkPupilExistById("pupilID"),
  ceController.filterByPupilID
);

// Filter paginated completed exercise by lessonID
router.get(
  "/filterByLessonID/:lessonID",
  lessonMiddleware.checkLessonExistById("lessonID"),
  ceController.filterByLessonID
);

// Filter paginated completed exercise by point
router.get("/filterByPoint", ceController.filterByPoint);

// Filter by pupilID & lessonID
router.get(
  "/filterByPupilAndLesson/:pupilID/:lessonID",
  pupilMiddleware.checkPupilExistById("pupilID"),
  lessonMiddleware.checkLessonExistById("lessonID"),
  ceController.filterByPupilAndLesson
);

// Filter by lessonID & point
router.get(
  "/filterByLessonIDAndPoint/:lessonID",
  lessonMiddleware.checkLessonExistById("lessonID"),
  ceController.filterByLessonIDAndPoint
);

module.exports = router;
