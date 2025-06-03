const express = require("express");
const TestController = require("../app/controllers/TestController");
const router = express.Router();

router.post("/", TestController.create);
router.get("/", TestController.getAll);
router.get("/getTestByLessonId/:id", TestController.getByLessonId);
router.get("/getTestByPupils/:id", TestController.getTestByPupilId);
router.get("/getTestByLesson/:id", TestController.getTestsByLesson);
router.get("/getTestByPupilAndLesson/:pupilId/lesson/:lessonId", TestController.getTestsByPupilIdAndLesson);
// router.get("/getByExerciseId/:id", TestController.getByExerciseId);
router.get("/:id", TestController.getById);
router.put("/:id", TestController.update);

module.exports = router;
