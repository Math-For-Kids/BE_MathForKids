const express = require("express");
const userController = require("../app/controllers/UserController_V2");
const userMiddleware = require("../app/middlewares/UserMiddleware");
const router = express.Router();

// Get all users
router.get("/", userController.getAll);
// Get user by ID
router.get("/:id", userMiddleware.checkUserExistById, userController.getById);
// Count all exist user
router.get("/countuser", userController.countUsers);
// Count new users by month
router.get("/countusersbymonth", userController.countUsersByMonth);
// Count new users by week
router.get("/countusersbyweek", userController.countUsersByWeek);
// Count new users by year
router.get("/countusersbyyear", userController.countUsersByYear);
// Create user
router.post(
  "/",
  userMiddleware.checkPhoneExistForCreate,
  userMiddleware.checkEmailExistForCreate,
  userController.create
);
// Update user information
router.put("/updateProfile/:id", userMiddleware.checkUserExistById, userController.update);
// Update image profile
router.put(
  "/updateImageProfile/:id",
  upload.single("image"),
  userController.uploadAvatarToS3
);
// Update phone number
router.put(
  "/updatePhone/:id",
  userMiddleware.checkUserExistById,
  userMiddleware.checkPhoneExistForUpdate,
  userController.update
);
// Update email
router.put(
  "/updateEmail/:id",
  userMiddleware.checkUserExistById,
  userMiddleware.checkEmailExistForUpdate,
  userController.update
);
// Update pin
router.put(
  "/updatePin/:id",
  userMiddleware.checkUserExistById,
  userMiddleware.checkPin,
  userController.update
);

module.exports = router;
