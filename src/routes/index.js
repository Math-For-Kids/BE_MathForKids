const lessonRouter = require("../routes/LessonRouter");
const exerciseRouter = require("../routes/ExerciseRouter");
const goalRouter = require("../routes/GoalRouter");
const rewardRouter = require("../routes/RewardRouter");
const ownedrewardRouter = require("../routes/OwnedRewardRouter");
const rankedpointsRouter = require("../routes/RankedPointRouter");
const completedexercisesRouter = require("../routes/CompletedExerciseRouter");
const testsRouter = require("../routes/TestRouter");
const authRouter = require("../routes/AuthRouter");
const userRouter = require("../routes/UserRouter");

function route(app) {
  app.use("/lesson", lessonRouter);
  app.use("/exercise", exerciseRouter);
  app.use("/goal", goalRouter);
  app.use("/reward", rewardRouter);
  app.use("/ownereward", ownedrewardRouter);
  app.use("/rankedpoints", rankedpointsRouter);
  app.use("/completedexercises", completedexercisesRouter);
  app.use("/tests", testsRouter);
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
}

module.exports = route;
