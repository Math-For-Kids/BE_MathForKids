const express = require("express");
const router = express.Router();
const AssessmentController = require("../app/controllers/AssessmentsController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.fields([
    { name: "options", maxCount: 3 }, // Cho phép upload tối đa 3 ảnh cho options
    { name: "answer", maxCount: 1 }, // Cho phép upload 1 ảnh cho answer
]), AssessmentController.create);
router.get("/enabled", AssessmentController.getEnabledAssessment);
router.get("/", AssessmentController.getAll);
router.get("/:id", AssessmentController.getById);
router.put("/:id", upload.array("image", 1), AssessmentController.update);
router.put("/disable/:id", AssessmentController.delete);

module.exports = router;
