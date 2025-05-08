const express = require("express");
const goalController = require("../app/controllers/GoalController");
const router = express.Router();

router.post("/", goalController.create);
router.get("/:id", goalController.getById);
router.get("/",goalController.getAll);
router.put("/:id",goalController.update);
router.delete("/:id", goalController.delete);

module.exports = router;
