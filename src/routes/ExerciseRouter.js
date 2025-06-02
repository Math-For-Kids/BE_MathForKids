const express = require("express");
const exerciseController = require("../app/controllers/ExerciseController");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
// Map multiple file fields
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'option', maxCount: 3 },
    { name: 'answer', maxCount: 1 },
]);
router.post("/", uploadFields, exerciseController.create);
router.get("/", exerciseController.getAll);
router.get("/lessonId/:id", exerciseController.getByLessonQuery);
router.get("/enabled", exerciseController.getEnabledExercises);
router.get("/getByLesson/:lessonId", exerciseController.getByLesson);
router.get("/getEnabledByLesson/:lessonId", exerciseController.getEnabledByLesson);
router.get("/:id", exerciseController.getById);
router.put("/:id", uploadFields, exerciseController.update);
// router.put("/disable/:id", exerciseController.delete);

module.exports = router;
