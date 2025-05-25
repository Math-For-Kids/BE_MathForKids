const express = require("express");
const TestController = require("../app/controllers/TestController");
const router = express.Router();

router.post("/", TestController.create);
router.get("/", TestController.getAll);
router.get("/getByLessonId/:id", TestController.getByLessonId);
// router.get("/getByExerciseId/:id", TestController.getByExerciseId);
router.get("/:id", TestController.getById);
router.put("/:id", TestController.update);

module.exports = router;
