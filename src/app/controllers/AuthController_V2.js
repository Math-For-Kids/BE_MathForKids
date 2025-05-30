const User = require("../models/User");
const {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  Timestamp,
  writeBatch,
  deleteField,
} = require("firebase/firestore");
const db = getFirestore();
const { smsService } = require("../services/SmsService");
const { mailService } = require("../services/MailService");
const jwt = require("jsonwebtoken");

const convertToTimeStamp = (timePlus) => {
  const now = new Date();
  const expiration = new Date(now.getTime() + timePlus);
  return Timestamp.fromDate(expiration);
};

const verify = (user, otpCode) => {
  const error = new Error();
  // Kiểm tra OTP có khớp không
  if (user.otpCode !== otpCode) {
    error.statusCode = 400;
    error.message = {
      en: "The OTP is incorrect. Please try again.",
      vi: "Mã OTP không chính xác. Vui lòng thử lại.",
    };
    throw error;
  }
  // Kiểm tra thời gian hết hạn
  const now = convertToTimeStamp(0);
  if (now.toMillis() > user.otpExpiration.toMillis()) {
    error.statusCode = 400;
    error.message = {
      en: "The OTP has expired. Please resend a new one.",
      vi: "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.",
    };
    throw error;
  }
};

class AuthController {
  // Send OTP by phone number
  sendOTPByPhoneNumber = async (req, res, next) => {
    try {
      const { phoneNumber } = req.params;
      const { id } = req.user;
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const otpExpiration = convertToTimeStamp(5 * 60 * 1000);
      await smsService(
        phoneNumber,
        `Your OTP is ${otpCode}. Please do not send this to anyone.`,
        2,
        "5087a0dcd4ccd3a2"
      );
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        otpCode: otpCode,
        otpExpiration: otpExpiration,
      });
      return res.status(200).json({
        message: {
          en: "Send OTP successfully!",
          vi: "Gửi OTP thành công!",
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Send OTP by email
  sendOTPByEmail = async (req, res, next) => {
    try {
      const { email } = req.params;
      const { id } = req.user;
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const otpExpiration = convertToTimeStamp(5 * 60 * 1000);
      await mailService(email, otpCode);
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        otpCode: otpCode,
        otpExpiration: otpExpiration,
      });
      return res.status(200).json({
        message: {
          en: "Send OTP successfully!",
          vi: "Gửi OTP thành công!",
        },
      });
      return next();
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Verify OTP
  verifyOTP = async (req, res, next) => {
    try {
      const user = req.user;
      const { otpCode } = req.body;
      // Verify
      verify(user, otpCode);
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        message: error.statusCode
          ? error.message
          : {
              en: error.message,
              vi: "Đã xảy ra lỗi nội bộ.",
            },
      });
    }
  };

  // Verify and Authentication
  verifyOtpAndAuthenticate = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { otpCode } = req.body;

      // Verify OTP
      verify(user, otpCode);

      // Gửi token về client
      const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });
      const options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res
        .status(200)
        .cookie("token", token, options)
        .json({
          id: user.id,
          fullName: user.fullName,
          role: user.role,
          image: user.image || "",
          volume: user.volume,
          language: user.language,
          mode: user.mode,
          token,
        });
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        message: error.statusCode
          ? error.message
          : {
              en: error.message,
              vi: "Đã xảy ra lỗi nội bộ.",
            },
      });
    }
  };

  // Logout
  logout = async (req, res, next) => {
    try {
      res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      });
      return res.status(200).json({
        message: {
          en: "Logout successfully!",
          vi: "Đăng xuất thành công!",
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };
}

module.exports = new AuthController();
