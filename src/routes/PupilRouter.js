const express = require("express");
const pupilController = require("../app/controllers/PupilController");
const userMiddleware = require("../app/middlewares/UserMiddleware");
const pupilMiddleware = require("../app/middlewares/PupilMiddleware");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Create pupil
router.post("/", pupilController.create);
// Get count by isDisabled status
router.get("/countByDisabledStatus", pupilController.countByDisabledStatus);
// Filter by isDisabled with pagination
router.get("/filterByDisabledStatus", pupilController.filterByDisabledStatus);
// Get count by grade 
router.get("/countByGrade", pupilController.countByGrade);
// Filter by grade with pagination
router.get("/filterByGrade", pupilController.filterByGrade);
// Get count by grade and isDisabled status
router.get("/countByGradeAndDisabledStatus", pupilController.countByGradeAndDisabledStatus);
// Filter by grade and isDisabled with pagination
router.get("/filterByGradeAndDisabledStatus", pupilController.filterByGradeAndDisabledStatus);
// Get total count of all pupils
router.get("/countAll", pupilController.countAll);
// Get all pupils
router.get("/", pupilController.getAll);
// Get enabled pupils by user ID
router.get(
  "/getEnabledPupil/:userId",
  userMiddleware.checkUserExistById("userId"),
  pupilController.getEnabledPupilByUserId
);
// Get a pupil by ID
router.get(
  "/:id",
  pupilMiddleware.checkPupilExistById(),
  pupilController.getById
);
// Count all pupils
router.get("/countpupil", pupilController.countPupils);
// Count new pupils by month
router.get("/countpupilsbymonth", pupilController.countPupilsByMonth);
// Count new pupils by week
router.get("/countpupilsbyweek", pupilController.countPupilsByWeek);
// Count new pupils by year
router.get("/countpupilsbyyear", pupilController.countPupilsByYear);
// Count pupils by grade
router.get("/countbygrade", pupilController.countPupilsByGrade);
// Update pupil information
router.patch(
  "/updateProfile/:id",
  pupilMiddleware.checkPupilExistById(),
  pupilController.update
);
// Update image profile
router.patch(
  "/updateImageProfile/:id",
  pupilMiddleware.checkPupilExistById(),
  upload.single("image"),
  pupilController.uploadImageProfileToS3
);

module.exports = router;
