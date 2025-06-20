const express = require("express");
const completedLessonController = require("../app/controllers/CompletedLessonController");
const pupilMiddleware = require("../app/middlewares/PupilMiddleware");
const lessonMiddleware = require("../app/middlewares/LessonMiddleware");
const completedLessonMiddleware = require("../app/middlewares/CompletedLessonMiddleware");
const router = express.Router();

// Create completed lesson
router.post("/", completedLessonController.create);
// Get completed lessons by pupil ID
router.get(
  "/getByPupil/:pupilId",
  pupilMiddleware.checkPupilExistById("pupilId"),
  completedLessonController.getByPupil
);
// Get completed lesson by pupil ID & lesson
router.get(
  "/getByPupilAndLesson/:pupilId/lesson/:lessonId",
  pupilMiddleware.checkPupilExistById("pupilId"),
  lessonMiddleware.checkLessonExistById("lessonId"),  
  completedLessonController.getByPupilLesson
);
// Update completed lesson status
router.patch("/:id", 
  completedLessonMiddleware.checkCompletedLessonExistById,
  completedLessonController.updateStatus
)


module.exports = router;
