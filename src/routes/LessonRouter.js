const express = require("express");
const lessonController = require("../app/controllers/LessonController");
const lessonMiddleware = require("../app/middlewares/LessonMiddleware");
const router = express.Router();

// Create lesson
router.post(
  "/",
  lessonMiddleware.checkLessonNameExistForCreate,
  lessonController.create
);
router.get("/filterByDisabled", lessonController.filterByDisabledStatus);

// Count all lessons by grade & type
router.get("/countAll", lessonController.countAll);
// Get all paginated lessons by grade & type
router.get("/getAll", lessonController.getAll);
// Get enabled lessons by grade & type
router.get("/getByGradeAndType", lessonController.getByGradeAndType);
// Get a lesson by ID
router.get(
  "/:id",
  lessonMiddleware.checkLessonExistById(),
  lessonController.getById
);
// Count lessons by grade, type & disabled state
router.get("/countByDisabledStatus", lessonController.countByDisabledStatus);
// Filter paginated lessons by grade, type & disabled state
// Count all enable lessons
router.get("/countlesson", lessonController.countLessons);
// Update lesson
router.patch(
  "/:id",
  lessonMiddleware.checkLessonExistById(),
  lessonMiddleware.checkLessonNameExistForUpdate,
  lessonController.update
);

module.exports = router;
