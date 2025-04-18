const express = require("express");
const exerciseContrller = require("../app/controllers/ExerciseController");
const router = express.Router();

router.post("/", exerciseContrller.create);
router.get("/getByLesson/:lessonId", exerciseContrller.getByLesson);
router.get("/:id", exerciseContrller.getById);
router.put("/:id", exerciseContrller.update);
router.delete("/:id", exerciseContrller.delete);

module.exports = router;
