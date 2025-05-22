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
} = require("firebase/firestore");
const { smsService } = require("../services/SmsService");
const { mailService } = require("../services/MailService");
const userController = require("./UserController");

const db = getFirestore();

const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user: user,
    token,
  });
};

const checkUserExist = async (phoneNumber, email) => {
  let q;
  if (phoneNumber) {
    q = query(collection(db, "users"), where("phoneNumber", "==", phoneNumber));
  } else if (email) {
    q = query(collection(db, "users"), where("email", "==", email));
  }
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  else return querySnapshot.docs[0];
};

const updateUserData = async (phoneNumber, email, otp) => {
  // Tính thời gian hết hạn (hiện tại + 5 phút)
  const now = new Date();
  const expiration = new Date(now.getTime() + 5 * 60 * 1000); // 5 phút
  const userDoc = await checkUserExist(phoneNumber, email);
  const userRef = doc(db, "users", userDoc.id);
  await updateDoc(userRef, {
    otpCode: otp,
    otpExpiration: expiration,
  });
};

class AuthController {
  sendOTPByPhoneNumber = async (req, res, next) => {
    try {
      const phoneNumber = req.params.phoneNumber;
      const userDoc = await checkUserExist(phoneNumber, null);
      if (userDoc && userDoc.data().isVerify) {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        await smsService(
          phoneNumber,
          `Your OTP is ${otp}. Please do not send this to anyone.`,
          2,
          "5087a0dcd4ccd3a2"
        );
        updateUserData(phoneNumber, null, otp);
        return res.status(200).json({
          message: "OTP send successfully!",
          userId: userDoc.data().id,
        });
      } else {
        return res.status(404).json({
          message: "User is not found!",
        });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        message: "OTP send fail: " + error.message,
      });
    }
  };

  sendOTPByEmail = async (req, res, next) => {
    try {
      const email = req.params.email;
      const userDoc = await checkUserExist(null, email);
      if (userDoc && userDoc.data().isVerify) {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const response = await mailService(email, otp);
        if (response.status == 200) {
          updateUserData(null, email, otp);
          return res.status(200).json({
            message: response.message,
            userId: userDoc.id,
          });
        } else {
          return res.status(500).json({
            message: response.message,
          });
        }
      } else {
        return res.status(404).json({
          message: "User is not found!",
        });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  verify = async (req, res, next) => {
    try {
      const { id } = req.params; // ID của document
      const { otp } = req.body;

      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // const userData = User.fromFirestore(userSnap);
      const userData = userSnap.data(); // lấy trực tiếp data từ Firestore

      // Kiểm tra OTP có khớp không
      if (userData.otpCode !== otp) {
        return res
          .status(400)
          .json({ success: false, message: "OTP is invalid!" });
      }

      // Kiểm tra thời gian hết hạn
      const now = new Date();
      const expiration = new Date(
        userData.otpExpiration?.toDate?.() || userData.otpExpiration
      );
      if (now > expiration) {
        return res
          .status(400)
          .json({ success: false, message: "OTP is expired!" });
      }

      // Gửi token về client
      sendTokenResponse(userData, 200, res);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  logout = async (req, res, next) => {
    try {
      res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      });

      res.status(200).json({
        success: true,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
}

module.exports = new AuthController();
