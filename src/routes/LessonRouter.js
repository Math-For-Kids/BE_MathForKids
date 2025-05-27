const express = require("express");
const lessonController = require("../app/controllers/LessonController");
const router = express.Router();

router.get("/", lessonController.getAll);
router.get("/enabled", lessonController.getEnabledLessons);
router.post("/", lessonController.create);
router.get("/countlesson", lessonController.countLessons);
router.get("/getByGrade/:grade", lessonController.getByGrade);
router.get("/:id", lessonController.getById);
router.put("/:id", lessonController.update);
// router.put("/disable/:id", lessonController.delete);

module.exports = router;
