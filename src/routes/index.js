const lessonRouter = require("../routes/LessonRouter");
const exerciseRouter = require("../routes/ExerciseRouter");
const questionRouter = require("../routes/QuestionRouter");
const goalRouter = require("../routes/GoalRouter");
const rewardRouter = require("../routes/RewardRouter");
const ownedrewardRouter = require("../routes/OwnedRewardRouter");
const rankedpointsRouter = require("../routes/RankedPointRouter");
const completedexercisesRouter = require("../routes/CompletedExerciseRouter");
const testsRouter = require("../routes/TestRouter");
const pupilRouter = require("../routes/PupilRouter");
const notificationRouter = require("../routes/NotificationRouter");
const assessmentRouter = require("../routes/AssessmentRouter");

function route(app) {
  app.use("/lesson", lessonRouter);
  app.use("/exercise", exerciseRouter);
  app.use("/question", questionRouter);
  app.use("/goal", goalRouter);
  app.use("/reward", rewardRouter);
  app.use("/ownereward", ownedrewardRouter);
  app.use("/rankedpoints", rankedpointsRouter);
  app.use("/completedexercises", completedexercisesRouter);
  app.use("/tests", testsRouter);
  app.use("/pupil", pupilRouter);
  app.use("/notification", notificationRouter);
  app.use("/assessment", assessmentRouter)

}

module.exports = route;
