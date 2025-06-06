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

class UserController {
  // Get all users
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

  // Get user by ID
  getById = async (req, res, next) => {
    const id = req.params.id;
    const user = req.user;
    res.status(200).send({ id: id, ...user });
  };

  // Count all exist user
  countUsers = async (req, res, next) => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const userCount = usersSnapshot.size;
      res.status(200).send({ count: userCount });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  // Count new users by week
  countUsersByWeek = async (req, res, next) => {
    try {
      const { week, year } = req.query; // ví dụ: week=45, year=2025
      if (!week || !/^\d{1,2}$/.test(week) || !year || !/^\d{4}$/.test(year)) {
        return res.status(400).send({
          message: "Invalid week or year format. Use week=WW and year=YYYY",
        });
      }

      const weekNum = parseInt(week);
      const yearNum = parseInt(year);

      // Tính ngày bắt đầu và kết thúc của tuần
      const firstDayOfYear = new Date(yearNum, 0, 1);
      const firstMonday = new Date(firstDayOfYear);
      firstMonday.setDate(
        firstDayOfYear.getDate() + ((8 - firstDayOfYear.getDay()) % 7)
      );

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

      usersSnapshot.forEach((docSnap) => {
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

  // Count new users by month
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

  // Count new users by year
  countUsersByYear = async (req, res, next) => {
      try {
        const { year } = req.query; // ví dụ: year=2025
        if (!year || !/^\d{4}$/.test(year)) {
          return res
            .status(400)
            .send({ message: "Invalid year format. Use year=YYYY" });
        }
  
        const yearNum = parseInt(year);
        const yearStart = new Date(yearNum, 0, 1);
        const yearEnd = new Date(yearNum + 1, 0, 1);
        const prevYearStart = new Date(yearNum - 1, 0, 1);
        const prevYearEnd = new Date(yearNum, 0, 1);
  
        const usersSnapshot = await getDocs(collection(db, "users"));
        let currentYearCount = 0;
        let previousYearCount = 0;
  
        usersSnapshot.forEach((docSnap) => {
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
      }
    };

  // Create user
  create = async (req, res, next) => {
    try {
      const data = req.body;
      const date = new Date(data.dateOfBirth);
      const dateOfBirthTimestamp = Timestamp.fromDate(date);
      const userData = {
        ...data,
        email: data.email.toLowerCase(),
        dateOfBirth: dateOfBirthTimestamp,
        role: data.role ? data.role : "user",
        isVerify: false,
        otpCode: null,
        otpExpiration: null,
        volume: 100,
        language: "en",
        mode: "light",
        isDisabled: false,
        image: "",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "users"), userData);

      res.status(200).send({
        message: "User created successfully!",
        id: docRef.id,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  // Update user
  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;

      // Nếu có trường dateOfBirth thì chuyển thành Timestamp
      if (data.dateOfBirth) {
        const date = new Date(data.dateOfBirth);
        data.dateOfBirth = Timestamp.fromDate(date);
      }

      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        ...data,
        email: data.email.toLowerCase(),
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "User updated successfully!" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  // Update image profile
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
}

module.exports = new UserController();
