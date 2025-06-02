const express = require("express");
const userController = require("../app/controllers/UserController");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", userController.getAll);
router.post("/", userController.create);
router.get("/countuser", userController.countUsers);
router.get("/countusersbymonth", userController.countUsersByMonth);
router.get("/:id", userController.getById);
router.put("/:id", userController.update);
// router.put("/disable/:id", userController.delete);

// Đổi số điện thoại
router.post("/:id/otp-phone", userController.sendOTPForPhoneChange);
router.post("/:id/verify-phone", userController.verifyPhoneChange);
// Đổi email
router.post("/:id/otp-email", userController.sendOTPForEmailChange);
router.post("/:id/verify-email", userController.verifyEmailChange);
// Đổi  PIN
router.put("/:id/change-pin", userController.changePin);
router.put(
  "/:id/avatar",
  upload.single("image"),
  userController.uploadAvatarToS3
);
module.exports = router;
