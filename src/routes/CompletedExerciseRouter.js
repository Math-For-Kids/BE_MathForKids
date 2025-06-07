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
// Get completed exercise by ID
router.get(
  "/:id",
  ceMiddleware.checkCompletedExerciseExistById(),
  ceController.getById
);

//get all test pasge
router.get("/getall", ceController.getAllpasge);

// Filter paginated completed exercise by pupilID
router.get("/pupil/:pupilID", ceController.filterByPupilID);

// Filter paginated completed exercise by lessonID
router.get("/lesson/:lessonID", ceController.filterByLessonID);

// Filter paginated completed exercise by point
router.get("/point/:point", ceController.filterByPoint);

// Filter by pupilID & lessonID
router.get("/pupil/:pupilID/lesson/:lessonID", ceController.filterByPupilAndLesson);

// Filter by lessonID & point
router.get("/lesson/:lessonID/point/:point", ceController.filterByLessonIDAndPoint);


module.exports = router;
