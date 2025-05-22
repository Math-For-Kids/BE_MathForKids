const express = require("express");
const testquestionController = require("../app/controllers/TestQuestionController");
const router = express.Router();

router.post("/", testquestionController.create);
router.get("/enabled",testquestionController.getEnabledTestQuestion);
router.get("/",testquestionController.getAll);
router.get("/:id", testquestionController.getById);
router.put("/:id",testquestionController.update);
router.delete("/:id", testquestionController.delete);

module.exports = router;
