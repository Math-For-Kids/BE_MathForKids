const lessonRouter = require("../routes/LessonRouter");
const exerciseRouter = require("../routes/ExerciseRouter");
const questionRouter = require("../routes/QuestionRouter");

function route(app) {
  app.use("/lesson", lessonRouter);
  app.use("/exercise", exerciseRouter);
  app.use("/question", questionRouter);
}

module.exports = route;
