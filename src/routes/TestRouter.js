const express = require("express");
const testController = require("../app/controllers/TestController");
const pupilMiddleware = require("../app/middlewares/PupilMiddleware");
const lessonMiddleware = require("../app/middlewares/LessonMiddleware");
const testMiddleware = require("../app/middlewares/TestMiddleware");
const router = express.Router();

// Create test
router.post("/", testController.create);
// Count all paginated tests
router.get("/countAll", testController.countAll);
// Get all paginated tests
router.get("/getAll", testController.getAll);
// Count tests by pupil ID
router.get(
  "/countByPupilId/:pupilId",
  pupilMiddleware.checkPupilExistById("pupilID"),
  testController.countTestsByPupilID
);
// Filter paginated tests by pupilID
router.get(
  "/filterByPupilID/:pupilID",
  pupilMiddleware.checkPupilExistById("pupilID"),
  testController.filterByPupilID
);
// Count tests by lesson ID
router.get(
  "/countByLessonId/:lessonId",
  lessonMiddleware.checkLessonExistById("lessonID"),
  testController.countTestsByLessonID
);
// Filter paginated tests by lessonID
router.get(
  "/filterByLessonID/:lessonID",
  lessonMiddleware.checkLessonExistById("lessonID"),
  testController.filterByLessonID
);
// Count tests by point
router.get("/countByPoint", testController.countTestsByPoint);
// Filter paginated tests by point
router.get("/filterByPoint/", testController.filterByPoint);
// Count tests by lesson ID and pupil ID
router.get(
  "/countByPupilIDAndLessonID/:pupilID/:lessonID",
  pupilMiddleware.checkPupilExistById("pupilID"),
  lessonMiddleware.checkLessonExistById("lessonID"),
  testController.countTestsByPupilIdAndLessonId
);
// Filter by pupilID & lessonID
router.get(
  "/filterByPupilAndLesson/:pupilID/:lessonID",
  pupilMiddleware.checkPupilExistById("pupilID"),
  lessonMiddleware.checkLessonExistById("lessonID"),
  testController.filterByPupilAndLesson
);
// Count tests by lessonID & point
router.get(
  "/countByLessonIDAndPoint/:lessonID",
  lessonMiddleware.checkLessonExistById("lessonID"),
  testController.countTestsByLessonIdAndPoint
);
// Filter by lessonID & point
router.get(
  "/filterByLessonIDAndPoint/:lessonID",
  lessonMiddleware.checkLessonExistById("lessonID"),
  testController.filterByLessonIDAndPoint
);
// Get test by ID
router.get("/:id", testMiddleware.checkTestExistById(), testController.getById);

module.exports = router;
