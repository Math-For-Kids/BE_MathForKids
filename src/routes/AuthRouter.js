const express = require("express");
const authController = require("../app/controllers/AuthController");
const userMiddleware = require("../app/middlewares/UserMiddleware");
const router = express.Router();

// Send OTP by phone number
router.post(
  "/sendOtpByPhone/:phoneNumber",
  userMiddleware.checkUserExistByPhone,
  userMiddleware.checkIsDisabled,
  authController.sendOTPByPhoneNumber
);
// Send OTP by email
router.post(
  "/sendOtpByEmail/:email",
  userMiddleware.checkUserExistByEmail,
  userMiddleware.checkIsDisabled,
  authController.sendOTPByEmail
);
// Send OTP to update new phone number
router.post(
  "/sendOtpToUpdatePhone/:id",
  userMiddleware.checkUserExistById(),
  userMiddleware.checkPhoneExistForUpdate,
  authController.sendOTPByPhoneNumber
);
// Send OTP to update new email
router.post(
  "/sendOtpToUpdateEmail/:id",
  userMiddleware.checkUserExistById(),
  userMiddleware.checkEmailExistForUpdate,
  authController.sendOTPByEmail
);
// Verify only OTP
router.post(
  "/verifyOTP/:id",
  userMiddleware.checkUserExistById(),
  authController.verifyOTP
);
// Verify and authentication
router.post(
  "/verifyAndAuthentication/:id",
  userMiddleware.checkUserExistById(),
  authController.verifyOtpAndAuthenticate
);
// Logout
router.post("/logout", authController.logout);

module.exports = router;
