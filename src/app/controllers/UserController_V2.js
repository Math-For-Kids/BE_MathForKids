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
