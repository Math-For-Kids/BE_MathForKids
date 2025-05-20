const express = require("express");
const router = express.Router();
const AssessmentController = require("../app/controllers/AssessmentsController");


router.post("/", AssessmentController.create);
router.get("/enabled", AssessmentController.getEnabledAssessment);
router.get("/", AssessmentController.getAll);
router.get("/:id", AssessmentController.getById);
router.put("/:id", AssessmentController.update);
router.delete("/:id", AssessmentController.delete);

module.exports = router;
