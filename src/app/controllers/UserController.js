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
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../services/AwsService");
const { v4: uuidv4 } = require("uuid");
const { smsService } = require("../services/SmsService");
const { mailService } = require("../services/MailService");

class UserController {
  getAll = async (req, res, next) => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      res.status(200).send(users);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };
  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const userRef = doc(db, "users", id);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.data();
        res.status(200).send({ id: snapshot.id, ...userData }); // ✅ avatar sẽ có ở đây
      } else {
        res.status(404).send({ message: "User not found!" });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  create = async (req, res, next) => {
    try {
      const data = req.body;
      const date = new Date(data.dateOfBirth);
      const dateOfBirthTimestamp = Timestamp.fromDate(date);
      const userData = {
        ...data,
        dateOfBirth: dateOfBirthTimestamp,
        role: "user",
        isVerify: false,
        otpCode: null,
        otpExpiration: null,
        volume: 100,
        language: "en",
        mode: "light",
        isDisabled: false,
        image: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "users"), userData);

      res.status(200).send({
        message: "User created successfully!",
        id: docRef.id,
        role: userData.role,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { createdAt, dateOfBirth, ...data } = req.body;

      // Nếu có trường dateOfBirth thì chuyển thành Timestamp
      if (dateOfBirth) {
        const date = new Date(dateOfBirth);
        data.dateOfBirth = Timestamp.fromDate(date);
      }

      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      res.status(200).send({ message: "User updated successfully!" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { createdAt, ...data } = req.body;
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });

      const pupilQuery = query(
        collection(db, "pupils"),
        where("userId", "==", id)
      );
      const pupilSnapshot = await getDocs(pupilQuery);

      const batch = writeBatch(db);
      pupilSnapshot.forEach((docSnap) => {
        const pupilRef = doc(db, "pupils", docSnap.id);
        batch.update(pupilRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      res
        .status(200)
        .send({ message: "User and related pupils disabled successfully!" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  countUsers = async (req, res, next) => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const userCount = usersSnapshot.size;
      res.status(200).send({ count: userCount });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  countUsersByMonth = async (req, res, next) => {
    try {
      const { month } = req.query; // ví dụ: "05"
      if (!month || !/^\d{2}$/.test(month)) {
        return res
          .status(400)
          .send({ message: "Invalid month format. Use MM" });
      }

      const now = new Date();
      const year = now.getFullYear();
      const monthIndex = parseInt(month) - 1;

      const currentStart = new Date(year, monthIndex, 1);
      const currentEnd = new Date(year, monthIndex + 1, 1);

      const prevMonthIndex = (monthIndex - 1 + 12) % 12;
      const prevYear = monthIndex === 0 ? year - 1 : year;
      const prevStart = new Date(prevYear, prevMonthIndex, 1);
      const prevEnd = new Date(prevYear, prevMonthIndex + 1, 1);

      const usersSnapshot = await getDocs(collection(db, "users"));
      let currentCount = 0;
      let previousCount = 0;

      usersSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.createdAt && data.createdAt.toDate) {
          const createdAt = data.createdAt.toDate();
          if (createdAt >= currentStart && createdAt < currentEnd) {
            currentCount++;
          } else if (createdAt >= prevStart && createdAt < prevEnd) {
            previousCount++;
          }
        }
      });

      res.status(200).send({
        month,
        currentMonthCount: currentCount,
        previousMonthCount: previousCount,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  uploadAvatarToS3 = async (req, res, next) => {
    try {
      const id = req.params.id;
      const file = req.file;

      if (!file || !file.buffer) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileExt = file.originalname.split(".").pop();
      const key = `avatars/${id}_${uuidv4()}.${fileExt}`;

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      });

      await s3.send(command);

      const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        image: publicUrl,
        updatedAt: serverTimestamp(),
      });

      res.status(200).json({
        message: "Profile image  uploaded successfully!",
        image: publicUrl,
      });
    } catch (error) {
      console.error("S3 upload error:", error);
      res.status(500).json({ message: "Upload failed", error });
    }
  };

  changePin = async (req, res) => {
    try {
      const { id } = req.params;
      const { newPin, oldPin } = req.body;

      if (!newPin || !oldPin) {
        return res.status(400).json({ message: "Missing newPin or oldPin" });
      }

      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = userSnap.data();

      if (userData.pin !== oldPin) {
        return res.status(403).json({ message: "Incorrect old PIN" });
      }

      await updateDoc(userRef, {
        pin: newPin,
        updatedAt: serverTimestamp(),
      });

      return res.status(200).json({ message: "PIN updated successfully!" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  // update otp
  updateUserData = async (userDoc, otpCode) => {
    await updateDoc(doc(db, "users", userDoc.id), {
      otpCode,
      otpExpiration: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
      updatedAt: serverTimestamp(),
    });
  };

  // Gửi OTP qua SMS đến số điện thoại (số cũ)
  sendOtpToPhone = async (userDoc, phoneNumber, message) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await smsService(
      phoneNumber,
      `Your OTP is ${otp}. Please do not send this to anyone.`,
      2,
      "5087a0dcd4ccd3a2"
    );

    await this.updateUserData(userDoc, otp);

    return otp;
  };

  //Gửi OTP để xác thực đổi số điện thoại mới
  sendOTPForPhoneChange = async (req, res) => {
    try {
      const { id } = req.params;
      const { newPhoneNumber } = req.body;

      if (!newPhoneNumber) {
        return res.status(400).json({ message: "Missing newPhoneNumber" });
      }

      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return res.status(404).json({ message: "User not found" });
      }

      await updateDoc(userRef, {
        pendingPhoneNumber: newPhoneNumber,
        otpExpiration: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
        updatedAt: serverTimestamp(),
      });

      return res.status(200).json({ message: "OTP sent to old phone number" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  // Xác thực OTP đổi số điện thoại và cập nhật số mới
  verifyPhoneChange = async (req, res) => {
    try {
      const { id } = req.params;
      const { otpCode } = req.body;

      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = userSnap.data();

      if (user.otpCode !== otpCode) {
        return res.status(400).json({ message: "OTP is invalid!" });
      }

      const now = new Date();
      const expiration = user.otpExpiration?.toDate?.() || new Date(0);
      if (now > expiration) {
        return res.status(400).json({ message: "OTP expired" });
      }

      if (!user.pendingPhoneNumber) {
        return res.status(400).json({ message: "No pending phone number" });
      }

      await updateDoc(userRef, {
        phoneNumber: user.pendingPhoneNumber,
        pendingPhoneNumber: deleteField(),
        updatedAt: serverTimestamp(),
      });

      return res
        .status(200)
        .json({ message: "Phone number updated successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  // Gửi OTP tới email cũ
  sendOTPForEmailChange = async (req, res) => {
    try {
      const { id } = req.params;
      const { newEmail } = req.body;

      if (!newEmail) {
        return res.status(400).json({ message: "Missing newEmail" });
      }

      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return res.status(404).json({ message: "User not found" });
      }

      const userDoc = userSnap;
      const oldEmail = userDoc.data().email;

      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      const response = await mailService(oldEmail, otp);
      if (response.status !== 200) {
        return res.status(500).json({ message: response.message });
      }

      await this.updateUserData(userDoc, otp);

      await updateDoc(userRef, {
        pendingEmail: newEmail,
        otpExpiration: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
        updatedAt: serverTimestamp(),
      });

      return res.status(200).json({ message: "OTP sent to old email" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  // Xác thực OTP đổi email và cập nhật email mới
  verifyEmailChange = async (req, res) => {
    try {
      const { id } = req.params;
      const { otpCode } = req.body;

      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = userSnap.data();

      if (user.otpCode !== otpCode) {
        return res.status(400).json({ message: "OTP is invalid!" });
      }

      const now = new Date();
      const expiration = user.otpExpiration?.toDate?.() || new Date(0);
      if (now > expiration) {
        return res.status(400).json({ message: "OTP expired" });
      }

      if (!user.pendingEmail) {
        return res.status(400).json({ message: "No pending email" });
      }

      await updateDoc(userRef, {
        email: user.pendingEmail,
        pendingEmail: deleteField(),
        updatedAt: serverTimestamp(),
      });

      return res.status(200).json({ message: "Email updated successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

module.exports = new UserController();
