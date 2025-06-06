const express = require("express");
const goalController = require("../app/controllers/GoalController");
const pupilMiddleware = require("../app/middlewares/PupilMiddleware");
const goalMiddleware = require("../app/middlewares/GoalMiddleware");
const router = express.Router();

// Create goal
router.post("/", goalController.create);
// Get goals in 30 days by pupil ID
router.get(
  "/getWithin30Days/:pupilId",
  pupilMiddleware.checkPupilExistById("pupilId"),
  goalController.getWithin30DaysByPupilId
);
// Get a goal by ID
router.get("/:id", goalMiddleware.checkGoalExistById, goalController.getById);
// Update goal
router.patch("/:id", goalMiddleware.checkGoalExistById, goalController.update);

module.exports = router;
