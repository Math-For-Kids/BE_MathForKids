const express = require("express");
const questionContrller = require("../app/controllers/QuestionController");
const router = express.Router();

router.post("/", questionContrller.create);
router.get("/getByExercise/:exerciseId", questionContrller.getByExercise);
router.get("/:id", questionContrller.getById);
router.put("/:id", questionContrller.update);
router.delete("/:id", questionContrller.delete);

module.exports = router;
