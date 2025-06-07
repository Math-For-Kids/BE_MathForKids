const express = require("express");
const testController = require("../app/controllers/TestController");
const pupilMiddleware = require("../app/middlewares/PupilMiddleware");
const lessonMiddleware = require("../app/middlewares/LessonMiddleware");
const testMiddleware = require("../app/middlewares/TestMiddleware");
const router = express.Router();

// Create test
router.post("/", testController.create);
// Get all paginated tests
router.get("/getAll", testController.getAll);
// Filter paginated tests by pupilID
router.get(
  "/filterByPupilID/:pupilID",
  pupilMiddleware.checkPupilExistById("pupilID"),
  testController.filterByPupilID
);
// Filter paginated tests by lessonID
router.get(
  "/filterByLessonID/:lessonID",
  lessonMiddleware.checkLessonExistById("lessonID"),
  testController.filterByLessonID
);
// Filter paginated tests by point
router.get("/filterByPoint/", testController.filterByPoint);
// Filter by pupilID & lessonID
router.get(
  "/filterByPupilAndLesson/:pupilID/:lessonID",
  pupilMiddleware.checkPupilExistById("pupilID"),
  lessonMiddleware.checkLessonExistById("lessonID"),
  testController.filterByPupilAndLesson
);
// Filter by lessonID & point
router.get(
  "/filterByLessonIDAndPoint/:lessonID",
  lessonMiddleware.checkLessonExistById("lessonID"),
  testController.filterByLessonIDAndPoint
);
// Get test by ID
router.get(
  "/:id",
  testMiddleware.checkTestExistById(),
  testController.getById
);

module.exports = router;
