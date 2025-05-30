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
      res.status(400).send({ message: error.message });
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
      res.status(400).send({ message: error.message });
    }
  };

  create = async (req, res, next) => {
    try {
      const data = req.body;
      const date = new Date(data.dateOfBirth);
      const dateOfBirthTimestamp = Timestamp.fromDate(date);
      const pin = data.pin;

      const userData = {
        ...data,
        dateOfBirth: dateOfBirthTimestamp,
        role: "user",
        isVerify: false,
        otpCode: "",
        otpExpiration: null,
        volume: 100,
        language: "en",
        mode: "light",
        isDisabled: false,
        image: "",
        pin,
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
      res.status(400).send({ message: error.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { isDisabled, createdAt, dateOfBirth, ...data } = req.body;

      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      if (dateOfBirth) {
        const date = new Date(dateOfBirth);
        if (!isNaN(date)) {
          updateData.dateOfBirth = Timestamp.fromDate(date);
        } else {
          throw new Error("Invalid dateOfBirth format");
        }
      }
      if (isDisabled !== undefined) {
        updateData.isDisabled = isDisabled;
      }
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, updateData);
      if (isDisabled !== undefined) {
        const pupilQuery = query(collection(db, "pupils"), where("userId", "==", id));
        const pupilSnapshot = await getDocs(pupilQuery);

        const batch = writeBatch(db);
        pupilSnapshot.forEach(docSnap => {
          const pupilRef = doc(db, "pupils", docSnap.id);
          batch.update(pupilRef, {
            isDisabled: isDisabled,
            updatedAt: serverTimestamp(),
          });
        });

        await batch.commit();
      }

      res.status(200).send({ message: "User updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
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
      res.status(400).send({ message: error.message });
    }
  };

  countUsers = async (req, res, next) => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const userCount = usersSnapshot.size;
      res.status(200).send({ count: userCount });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  countUsersByMonth = async (req, res, next) => {
    try {
      const { month, year } = req.query; // ví dụ: month=05, year=2025
      if (!month || !/^\d{2}$/.test(month) || !year || !/^\d{4}$/.test(year)) {
        return res.status(400).send({ message: "Invalid month or year format. Use month=MM and year=YYYY" });
      }

      const yearNum = parseInt(year);
      const monthIndex = parseInt(month) - 1;

      const currentStart = new Date(yearNum, monthIndex, 1);
      const currentEnd = new Date(yearNum, monthIndex + 1, 1);

      const prevMonthIndex = (monthIndex - 1 + 12) % 12;
      const prevYear = monthIndex === 0 ? yearNum - 1 : yearNum;
      const prevStart = new Date(prevYear, prevMonthIndex, 1);
      const prevEnd = new Date(prevYear, prevMonthIndex + 1, 1);

      const usersSnapshot = await getDocs(collection(db, "users"));
      let currentMonthCount = 0;
      let previousMonthCount = 0;

      usersSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.createdAt && data.createdAt.toDate) {
          const createdAt = data.createdAt.toDate();
          if (createdAt >= currentStart && createdAt < currentEnd) {
            currentMonthCount++;
          } else if (createdAt >= prevStart && createdAt < prevEnd) {
            previousMonthCount++;
          }
        }
      });

      res.status(200).send({
        month,
        year: yearNum,
        currentMonthCount,
        previousMonthCount,
      });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  
  countUsersByWeek = async (req, res, next) => {
    try {
      const { week, year } = req.query; // ví dụ: week=45, year=2025
      if (!week || !/^\d{1,2}$/.test(week) || !year || !/^\d{4}$/.test(year)) {
        return res.status(400).send({ message: "Invalid week or year format. Use week=WW and year=YYYY" });
      }

      const weekNum = parseInt(week);
      const yearNum = parseInt(year);

      // Tính ngày bắt đầu và kết thúc của tuần
      const firstDayOfYear = new Date(yearNum, 0, 1);
      const firstMonday = new Date(firstDayOfYear);
      firstMonday.setDate(firstDayOfYear.getDate() + ((8 - firstDayOfYear.getDay()) % 7));

      const weekStart = new Date(firstMonday);
      weekStart.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      // Tính tuần trước
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(weekStart.getDate() - 7);
      const prevWeekEnd = new Date(weekStart);

      const usersSnapshot = await getDocs(collection(db, "users"));
      let currentWeekCount = 0;
      let previousWeekCount = 0;

      usersSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.createdAt && data.createdAt.toDate) {
          const createdAt = data.createdAt.toDate();
          if (createdAt >= weekStart && createdAt < weekEnd) {
            currentWeekCount++;
          } else if (createdAt >= prevWeekStart && createdAt < prevWeekEnd) {
            previousWeekCount++;
          }
        }
      });

      res.status(200).send({
        week: weekNum,
        year: yearNum,
        currentWeekCount,
        previousWeekCount,
      });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  countUsersByYear = async (req, res, next) => {
    try {
      const { year } = req.query; // ví dụ: year=2025
      if (!year || !/^\d{4}$/.test(year)) {
        return res.status(400).send({ message: "Invalid year format. Use year=YYYY" });
      }

      const yearNum = parseInt(year);
      const yearStart = new Date(yearNum, 0, 1);
      const yearEnd = new Date(yearNum + 1, 0, 1);
      const prevYearStart = new Date(yearNum - 1, 0, 1);
      const prevYearEnd = new Date(yearNum, 0, 1);

      const usersSnapshot = await getDocs(collection(db, "users"));
      let currentYearCount = 0;
      let previousYearCount = 0;

      usersSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.createdAt && data.createdAt.toDate) {
          const createdAt = data.createdAt.toDate();
          if (createdAt >= yearStart && createdAt < yearEnd) {
            currentYearCount++;
          } else if (createdAt >= prevYearStart && createdAt < prevYearEnd) {
            previousYearCount++;
          }
        }
      });

      res.status(200).send({
        year: yearNum,
        currentYearCount,
        previousYearCount,
      });
    } catch (error) {
      res.status(400).send({ message: error.message });
      
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
