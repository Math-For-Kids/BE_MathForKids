const express = require("express");
const lessonDetailController = require("../app/controllers/LessonDetailController");
const router = express.Router();

router.post("/", lessonDetailController.create);
router.get("/", lessonDetailController.getAll);
router.get("/byLesson/:lessonId", lessonDetailController.getByLessonId);
router.get("/:id", lessonDetailController.getById);
router.put("/:id", lessonDetailController.update);
router.put("/disable/:id", lessonDetailController.delete);
// router.get("/count/:lessonId", lessonDetailController.countByLessonId);

module.exports = router;
