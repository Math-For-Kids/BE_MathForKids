const express = require("express");
const testController = require("../app/controllers/TestController");
const pupilMiddleware = require("../app/middlewares/PupilMiddleware");
const lessonMiddleware = require("../app/middlewares/LessonMiddleware");
const testMiddleware = require("../app/middlewares/TestMiddleware");
const router = express.Router();

// Create test
router.post("/", testController.create);
// Get all tests
router.get("/", testController.getAll);
// Get tests by pupil ID
router.get(
  "/getByPupil/:pupilId",
  pupilMiddleware.checkPupilExistById("pupilId"),
  testController.getTestByPupilId
);
// Get tests by lesson ID
router.get(
  "/getByLesson/:lessonId",
  lessonMiddleware.checkLessonExistById("lessonId"),
  testController.getTestsByLesson
);
// Get test by pupil ID & lesson ID
router.get(
  "/getByPupilAndLesson/:pupilId/lesson/:lessonId",
  pupilMiddleware.checkPupilExistById("pupilId"),
  lessonMiddleware.checkLessonExistById("lessonId"),
  testController.getTestsByPupilIdAndLesson
);
// Get test by ID
router.get("/:id", testMiddleware.checkTestExistById(), testController.getById);

module.exports = router;
