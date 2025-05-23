const express = require("express");
const lessonController = require("../app/controllers/LessonController");
const router = express.Router();

router.post("/", lessonController.create);
router.get("/", lessonController.getAll);
router.get("/countlesson", lessonController.countLessons);
router.get("/:id", lessonController.getById);
router.get("/getByGrade/:grade", lessonController.getByGrade);
router.put("/:id", lessonController.update);
router.delete("/:id", lessonController.delete);

module.exports = router;
