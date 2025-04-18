const express = require("express");
const lessonContrller = require("../app/controllers/LessonController");
const router = express.Router();

router.post("/", lessonContrller.create);
router.get("/", lessonContrller.getAll);
router.get("/:id", lessonContrller.getById);
router.get("/getByGrade/:grade", lessonContrller.getByGrade);
router.put("/:id", lessonContrller.update);
router.delete("/:id", lessonContrller.delete);

module.exports = router;
