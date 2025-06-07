const express = require("express");
const exerciseController = require("../app/controllers/ExerciseController");
const lessonMiddleware = require("../app/middlewares/LessonMiddleware");
const levelMiddleware = require("../app/middlewares/LevelMiddleware");
const exerciseMiddleware = require("../app/middlewares/ExerciseMiddleware");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
// Map multiple file fields
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "option", maxCount: 3 },
  { name: "answer", maxCount: 1 },
]);

// Create exercise
router.post("/", uploadFields, exerciseController.create);
// Count all exercises by lesson ID
router.get(
  "/countByLesson/:lessonId",
  lessonMiddleware.checkLessonExistById("lessonId"),
  exerciseController.countByLesson
);
// Get all paginated exercises by lesson ID
router.get(
  "/getByLesson/:lessonId",
  lessonMiddleware.checkLessonExistById("lessonId"),
  exerciseController.getByLesson
);
// Count all exercises by lesson ID & level ID
router.get(
  "/countByLessonAndLevel/:lessonId/:levelId",
  lessonMiddleware.checkLessonExistById("lessonId"),
  levelMiddleware.checkLevelExistById("levelId"),
  exerciseController.countByLessonAndLevel
);
// Filter paginated exercises by lesson ID & level ID
router.get(
  "/filterByLevel/:lessonId/:levelId",
  lessonMiddleware.checkLessonExistById("lessonId"),
  levelMiddleware.checkLevelExistById("levelId"),
  exerciseController.filterByLessonAndLevel
);
router.get(
  "/filterByIsDisabled/:lessonId",
  lessonMiddleware.checkLessonExistById("lessonId"),
  exerciseController.filterByIsDisabled
);
// Get enabled exercises by lessonId
router.get(
  "/getEnabledByLesson/:lessonId",
  lessonMiddleware.checkLessonExistById("lessonId"),
  exerciseController.getEnabledByLesson
);
// Get an exercise by ID
router.get(
  "/:id",
  exerciseMiddleware.checkExerciseExistById,
  exerciseController.getById
);
// Update exercise
router.put(
  "/:id",
  exerciseMiddleware.checkExerciseExistById,
  uploadFields,
  exerciseController.update
);

module.exports = router;
