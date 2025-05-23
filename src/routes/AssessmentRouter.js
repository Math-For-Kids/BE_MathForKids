const express = require("express");
const router = express.Router();
const AssessmentController = require("../app/controllers/AssessmentsController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
// Map multiple file fields
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'option', maxCount: 3 },
    { name: 'answer', maxCount: 1 },
]);
router.post("/", uploadFields, AssessmentController.create);
router.get("/enabled", AssessmentController.getEnabledAssessment);
router.get("/", AssessmentController.getAll);
router.get("/:id", AssessmentController.getById);
router.put("/:id", uploadFields, AssessmentController.update);
router.put("/disable/:id", AssessmentController.delete);

module.exports = router;
