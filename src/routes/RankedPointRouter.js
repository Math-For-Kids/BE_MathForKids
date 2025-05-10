const express = require("express");
const RankedPointController = require("../app/controllers/RankedPointController");
const router = express.Router();

router.post("/", RankedPointController.create);
router.get("/", RankedPointController.getAll);
router.get("/getByLessonId/:id", RankedPointController.getByLessonId);
router.get("/getByStudentId/:id", RankedPointController.getByStudentId);
router.get("/:id", RankedPointController.getById);
router.put("/:id", RankedPointController.update);
router.delete("/:id", RankedPointController.delete);

module.exports = router;
