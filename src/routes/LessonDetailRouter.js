const express = require("express");
const router = express.Router();
const controller = require("../app/controllers/LessonDetailController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 1 }]),
  controller.create
);

router.post(
  "/full",
  upload.fields([
    { name: "define", maxCount: 1 },
    { name: "example", maxCount: 1 },
    { name: "remember", maxCount: 1 },
  ]),
  controller.createFullLesson
);
router.get("/lesson/:lessonId", controller.getByLessonId);
router.get("/:id", controller.getById);
router.put(
  "/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  controller.update
);

router.put(
  "/lessonId/:lessonId/order/:order",
  controller.updateByLessonIdAndOrder
);
router.delete("/lesson/:lessonId", controller.delete);

module.exports = router;
