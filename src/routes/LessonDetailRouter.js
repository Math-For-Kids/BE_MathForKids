const express = require("express");
const router = express.Router();
const controller = require("../app/controllers/LessonDetailController");

router.post("/", controller.create);
router.post("/full", controller.createFullLesson);
router.get("/lesson/:lessonId", controller.getByLessonId);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;
