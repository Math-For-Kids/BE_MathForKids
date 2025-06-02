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
  setDoc,
} = require("firebase/firestore");
const { smsService } = require("../services/SmsService");
const { mailService } = require("../services/MailService");
const jwt = require("jsonwebtoken");
const db = getFirestore();
const otpStore = {};

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
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

const storeOTPInFirestore = async (email, otp) => {
  const expiration = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
  const otpDocRef = doc(db, "otps", email); // email làm ID document
  await setDoc(otpDocRef, {
    email,
    otp,
    expire: expiration,
    createdAt: serverTimestamp(),
  }, { merge: true }); // merge true để không ghi đè toàn bộ nếu có trường khác
};

const getOTPFromFirestore = async (email) => {
  const otpDocRef = doc(db, "otps", email);
  const otpDocSnap = await getDoc(otpDocRef);

  if (otpDocSnap.exists()) {
    return otpDocSnap.data();
  } else {
    return null;
  }
};

const deleteOTPFromFirestore = async (email) => {
  await deleteDoc(doc(db, "otps", email));
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
        await mailService(email, otp);
        if (userDoc) {
          await updateUserData(userDoc, otp);
          return res.status(200).json({
            message: "success",
            userId: userDoc.id,
          });
        } else if (!userDoc.data().isVerify) {
          return res.status(403).json({
            message: "User account is not verified. Please sign up again.",
          });
        } else {
          return res.status(500).json({
            message: "fail",
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

  verifyOtpAndAuthenticate = async (req, res, next) => {
    try {
      const { id } = req.params;
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

  // logout = async (req, res, next) => {
  //   try {
  //     res.status(200).json({
  //       success: true,
  //       message: 'Logged out successfully',
  //     });
  //   } catch (err) {
  //     res.status(400).json({ success: false, message: err.message });
  //   }
  // };
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
      res.status(500).json({ success: false, message: err.message });
    }
  };



  sendOTPByEmailChange = async (req, res) => {
    try {
      const email = req.params.email;

      // Kiểm tra email trùng lặp
      const existingUser = await checkUserExist(null, email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already in use' });
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const response = await mailService(email, otp);
      if (response.status === 200) {
        await storeOTPInFirestore(email, otp);
        return res.status(200).json({
          success: true,
          message: 'OTP sent successfully',
          email,
        });
      }
      return res.status(500).json({ success: false, message: 'Failed to send email' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  verifyOTP = async (req, res) => {
    try {
      const { email, otp } = req.body;
      console.log(email, otp)
      if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
      }

      const record = await getOTPFromFirestore(email);
      if (!record) {
        return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
      }

      if (Date.now() > record.expire.toDate().getTime()) {
        await deleteOTPFromFirestore(email);
        return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
      }

      if (record.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      await deleteOTPFromFirestore(email); // Xóa OTP sau khi xác thực
      return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

}

module.exports = new AuthController();
