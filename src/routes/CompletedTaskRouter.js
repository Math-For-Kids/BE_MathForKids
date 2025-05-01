const express = require("express");
const router = express.Router();
const CompletedTaskController = require("../app/controllers/CompletedTaskController");

router.post("/", CompletedTaskController.create);
router.get("/", CompletedTaskController.getAll);
router.get("/:id", CompletedTaskController.getById);
router.get("/student/:studentId", CompletedTaskController.getByStudentId);
router.put("/:id", CompletedTaskController.update);
router.delete("/:id", CompletedTaskController.delete);

module.exports = router;
