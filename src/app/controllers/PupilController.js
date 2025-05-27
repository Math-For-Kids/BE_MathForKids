const Pupil = require("../models/Pupil");
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
} = require("firebase/firestore");

const db = getFirestore();
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../services/AwsService");
const { v4: uuidv4 } = require("uuid");
class PupilController {
  create = async (req, res, next) => {
    try {
      const data = req.body;
      const date = new Date(data.dateOfBirth);
      const dateOfBirthTimestamp = Timestamp.fromDate(date);
      await addDoc(collection(db, "pupils"), {
        ...data,
        dateOfBirth: dateOfBirthTimestamp,
        isDisabled: false,
        assess: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Pupil created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getAll = async (req, res, next) => {
    try {
      const pupils = await getDocs(collection(db, "pupils"));
      const pupilArray = pupils.docs.map((doc) => Pupil.fromFirestore(doc));
      res.status(200).send(pupilArray);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const pupilRef = doc(db, "pupils", id);
      const data = await getDoc(pupilRef);
      if (data.exists()) {
        const pupilData = Pupil.fromFirestore(data);
        res.status(200).send(pupilData);
      } else {
        res.status(404).send({ message: "Pupil not found!" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getEnabledPupil = async (req, res) => {
    try {
      const pupilsRef = collection(db, "pupils");
      const q = query(pupilsRef, where("isDisabled", "==", false));
      const snapshot = await getDocs(q);
      const pupils = snapshot.docs.map((doc) => Pupil.fromFirestore(doc));
      res.status(200).send(pupils);
    } catch (error) {
      res.status(400).send({ message: error.message });
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
      const pupilRef = doc(db, "pupils", id);
      await updateDoc(pupilRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Pupil updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  // Xóa học sinh
  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { createdAt, dateOfBirth, ...data } = req.body;
      const pupilRef = doc(db, "pupils", id);
      await updateDoc(pupilRef, { ...data, updatedAt: serverTimestamp() });
      res.status(200).send({ message: "Pupil disabled successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  countPupils = async (req, res, next) => {
    try {
      const pupilSnapshot = await getDocs(collection(db, "pupils"));
      const pupilCount = pupilSnapshot.size;
      res.status(200).send({ count: pupilCount });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  countPupilsByGrade = async (req, res, next) => {
    try {
      const pupilsRef = collection(db, "pupils");
      const q = query(pupilsRef, where("isDisabled", "==", false)); // Chỉ đếm học sinh chưa bị vô hiệu hóa
      const snapshot = await getDocs(q);

      // Tạo một object để lưu số lượng học sinh theo cấp lớp
      const gradeCounts = {};

      // Duyệt qua các document và đếm theo grade
      snapshot.docs.forEach((doc) => {
        const pupil = Pupil.fromFirestore(doc);
        const grade = pupil.grade; // Giả sử trường grade tồn tại trong model Pupil
        if (grade) {
          gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
        }
      });

      // Chuyển object thành mảng để trả về kết quả
      const result = Object.keys(gradeCounts).map((grade) => ({
        grade,
        count: gradeCounts[grade],
      }));

      res.status(200).send(result);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  countPupilsByMonth = async (req, res, next) => {
    try {
      const { month } = req.query; // ví dụ "2024-12"
      if (!month || !/^\d{2}$/.test(month)) {
        return res
          .status(400)
          .send({ message: "Invalid month format. Use YYYY-MM" });
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

      const pupilsSnapshot = await getDocs(collection(db, "users"));
      let currentCount = 0;
      let previousCount = 0;

      pupilsSnapshot.forEach((docSnap) => {
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
      res.status(400).send({ message: error.message });
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
      const key = `profile-images/${id}_${uuidv4()}.${fileExt}`;

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      });

      await s3.send(command);

      const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      const userRef = doc(db, "pupils", id);
      await updateDoc(userRef, {
        image: publicUrl,
        updatedAt: serverTimestamp(),
      });

      res.status(200).json({
        message: "Profile image uploaded successfully!",
        image: publicUrl,
      });
    } catch (error) {
      console.error("S3 upload error:", error);
      res.status(500).json({ message: "Upload failed", error });
    }
  };
}

module.exports = new PupilController();
