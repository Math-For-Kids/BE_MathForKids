const express = require("express");
const authController = require("../app/controllers/AuthController");
const router = express.Router();

router.post(
  "/sendOTPByPhoneNumber/:phoneNumber",
  authController.sendOTPByPhoneNumber
);
router.post("/sendOTPByEmail/:email", authController.sendOTPByEmail);
router.post("/verify/:id", authController.verify);
router.post("/sendOTPByEmailChange/:email", authController.sendOTPByEmailChange);
router.post("/verifyOTP", authController.verifyOTP);
router.get("/logout", authController.logout);

module.exports = router;
