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
const jwt = require("jsonwebtoken");
const db = getFirestore();

// const sendTokenResponse = (user, statusCode, res) => {
//   // Create token
//   const token = user.getSignedJwtToken();

//   const options = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//   };

//   res.status(statusCode).cookie("token", token, options).json({
//     success: true,
//     id: user.id,
//     fullName: user.fullName,
//     role: user.role,
//     volume: user.volume,
//     language: user.language,
//     mode: user.mode,
//     token,
//   });
// };

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      image: user.image || "",
      volume: user.volume,
      language: user.language,
      mode: user.mode,
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

const updateUserData = async (userDoc, otp) => {
  // Tính thời gian hết hạn (hiện tại + 5 phút)
  const now = new Date();
  const expiration = new Date(now.getTime() + 5 * 60 * 1000); // 5 phút
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
        await updateUserData(userDoc, otp);
        return res.status(200).json({
          message: "OTP send successfully!",
          userId: userDoc.data().id,
        });
      } else if (!userDoc.data().isVerify) {
        return res.status(403).json({
          message: "User account is not verified. Please sign up again.",
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
          await updateUserData(userDoc, otp);
          return res.status(200).json({
            message: response.message,
            userId: userDoc.id,
          });
        } else if (!userDoc.data().isVerify) {
          return res.status(403).json({
            message: "User account is not verified. Please sign up again.",
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
      const { otpCode } = req.body;

      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const userData = User.fromFirestore(userSnap);

      // Kiểm tra OTP có khớp không
      if (userData.otpCode !== otpCode) {
        return res
          .status(400)
          .json({ success: false, message: "OTP is invalid!" });
      }

      // Kiểm tra thời gian hết hạn
      const now = new Date();

      let expiration;
      if (userData.otpExpiration?.toDate) {
        expiration = userData.otpExpiration.toDate();
      } else if (
        typeof userData.otpExpiration === "string" ||
        typeof userData.otpExpiration === "number"
      ) {
        expiration = new Date(userData.otpExpiration);
      } else {
        return res.status(500).json({
          success: false,
          message: "OTP expiration is invalid",
        });
      }

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
