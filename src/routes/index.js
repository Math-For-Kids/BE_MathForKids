const lessonRouter = require("../routes/LessonRouter");
const exerciseRouter = require("../routes/ExerciseRouter");
const questionRouter = require("../routes/QuestionRouter");
const goalRouter = require("../routes/GoalRouter");
const rewardRouter = require("../routes/RewardRouter");
const ownedrewardRouter = require("../routes/OwnedRewardRouter");

function route(app) {
  app.use("/lesson", lessonRouter);
  app.use("/exercise", exerciseRouter);
  app.use("/question", questionRouter);
  app.use("/goal", goalRouter);
  app.use("/reward", rewardRouter);
  app.use("/ownereward", ownedrewardRouter);

}

module.exports = route;
