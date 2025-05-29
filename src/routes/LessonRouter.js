const express = require("express");
const lessonController = require("../app/controllers/LessonController");
const router = express.Router();

router.get("/", lessonController.getAll);
router.post("/", lessonController.create);
router.get("/countlesson", lessonController.countLessons);
router.get("/getByGradeAndType", lessonController.getByGradeAndType);
router.get("/:id", lessonController.getById);
router.put("/:id", lessonController.update);
// router.put("/disable/:id", lessonController.delete);

module.exports = router;
