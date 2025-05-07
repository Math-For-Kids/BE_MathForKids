const express = require("express");
const CompletedExercisesController = require("../app/controllers/CompletedExercisesController");
const router = express.Router();

router.post("/", CompletedExercisesController.create);
router.get("/", CompletedExercisesController.getAll);
router.get("/getByExerciseId/:id", CompletedExercisesController.getByExerciseId);
router.get("/:id", CompletedExercisesController.getById);
router.put("/:id", CompletedExercisesController.update);
router.delete("/:id", CompletedExercisesController.delete);

module.exports = router;
