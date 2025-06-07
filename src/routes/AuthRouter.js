const express = require("express");
const authController = require("../app/controllers/AuthController");
const userMiddleware = require("../app/middlewares/UserMiddleware");
const router = express.Router();

// Send OTP by phone number
router.post(
  "/sendOtpByPhone/:phoneNumber/:userRole",
  userMiddleware.checkUserExistByPhone,
  userMiddleware.checkIsDisabled,
  authController.sendOTPByPhoneNumber
);
// Send OTP by email
router.post(
  "/sendOtpByEmail/:email/:userRole",
  userMiddleware.checkUserExistByEmail,
  userMiddleware.checkIsDisabled,
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
