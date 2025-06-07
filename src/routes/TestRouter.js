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
//get all test pasge
router.get("/getall", testController.getAllpasge);

// Filter paginated tests by pupilID
router.get("/pupil/:pupilID", testController.filterByPupilID);

// Filter paginated tests by lessonID
router.get("/lesson/:lessonID", testController.filterByLessonID);

// Filter paginated tests by point
router.get("/point/:point", testController.filterByPoint);

// Filter by pupilID & lessonID
router.get("/pupil/:pupilID/lesson/:lessonID", testController.filterByPupilAndLesson);

// Filter by lessonID & point
router.get("/lesson/:lessonID/point/:point", testController.filterByLessonIDAndPoint);

module.exports = router;
