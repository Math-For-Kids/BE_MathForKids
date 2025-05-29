const express = require("express");
const authController = require("../app/controllers/AuthController_V2");
const userController = require("../app/controllers/UserController_V2");
const userMiddleware = require("../app/middlewares/UserMiddleware");
const router = express.Router();

// Send OTP by phone number
router.post(
  "/sendOtpByPhone/:phoneNumber",
  userMiddleware.checkUserExistByPhone,
  userMiddleware.checkIsDisabled,
  authController.sendOTPByPhoneNumber,
  userController.update
);
// Send OTP by email
router.post(
  "/sendOtpByEmail/:email",
  userMiddleware.checkUserExistByEmail,
  userMiddleware.checkIsDisabled,
  authController.sendOTPByEmail,
  userController.update
);
// Verify and authentication
router.post(
  "/verifyAndAuthentication/:id",
  userMiddleware.checkUserExistById,
  authController.verifyOtpAndAuthenticate
);
// Verify OTP normally
router.post(
  "/verifyOTP/:id",
  userMiddleware.checkUserExistById,
  authController.verifyOTP
);
// Logout
router.post("/logout", authController.logout);

module.exports = router;
