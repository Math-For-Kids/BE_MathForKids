const Pupil = require("../models/Pupil");
const {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  getCountFromServer,
  query,
  where,
  Timestamp,
} = require("firebase/firestore");
const db = getFirestore();
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../services/AwsService");
const { v4: uuidv4 } = require("uuid");
const FileController = require("./fileController");
class PupilController {
  countByGrade = async (req, res, next) => {
    try {
      const { grade } = req.query;
      const q = query(
        collection(db, "pupils"),
        where("grade", "==", grade),
      );
      const snapshot = await getCountFromServer(q);
      res.status(200).send({ count: snapshot.data().count });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };
  filterByGrade = async (req, res) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { grade } = req.query;

      let q;

      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "pupils", startAfterId));
        q = query(
          collection(db, "pupils"),
          where("grade", "==", parseInt(grade)),
          orderBy("createdAt", "desc"),
          startAfter(startDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "pupils"),
          where("grade", "==", parseInt(grade)),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const pupils = snapshot.docs.map((doc) => Pupil.fromFirestore(doc));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;
      res.status(200).send({
        data: pupils,
        nextPageToken: lastVisibleId,
      });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  countByGradeAndDisabledStatus = async (req, res, next) => {
    try {
      const { grade, isDisabled } = req.query;
      const q = query(
        collection(db, "pupils"),
        where("grade", "==", parseInt(grade)),
        where("isDisabled", "==", isDisabled === "true")
      );
      const snapshot = await getCountFromServer(q);
      res.status(200).send({ count: snapshot.data().count });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  filterByGradeAndDisabledStatus = async (req, res) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { grade, isDisabled } = req.query;

      let q;

      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "pupils", startAfterId));
        q = query(
          collection(db, "pupils"),
          where("grade", "==", parseInt(grade)),
          where("isDisabled", "==", isDisabled === "true"),
          orderBy("createdAt", "desc"),
          startAfter(startDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "pupils"),
          where("grade", "==", parseInt(grade)),
          where("isDisabled", "==", isDisabled === "true"),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const pupils = snapshot.docs.map((doc) => Pupil.fromFirestore(doc));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: pupils,
        nextPageToken: lastVisibleId,
      });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  countByDisabledStatus = async (req, res, next) => {
    try {
      const { isDisabled } = req.query;
      const q = query(
        collection(db, "pupils"),
        where("isDisabled", "==", isDisabled === "true")
      );
      const snapshot = await getCountFromServer(q);
      res.status(200).send({ count: snapshot.data().count });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  filterByDisabledStatus = async (req, res) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { isDisabled } = req.query;

      let q;

      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "pupils", startAfterId));
        q = query(
          collection(db, "pupils"),
          where("isDisabled", "==", isDisabled === "true"),
          orderBy("createdAt", "desc"),
          startAfter(startDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "pupils"),
          where("isDisabled", "==", isDisabled === "true"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const pupils = snapshot.docs.map((doc) => Pupil.fromFirestore(doc));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: pupils,
        nextPageToken: lastVisibleId,
      });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Create pupil
  create = async (req, res, next) => {
    try {
      const data = req.body;
      const date = new Date(data.dateOfBirth);
      const dateOfBirthTimestamp = Timestamp.fromDate(date);
      await addDoc(collection(db, "pupils"), {
        ...data,
        dateOfBirth: dateOfBirthTimestamp,
        isDisabled: false,
        isAssess: false,
        volume: 100,
        language: "en",
        mode: "light",
        point: 0,
        theme: "theme1",
        createdAt: serverTimestamp(),
      });
      res.status(201).send({
        message: {
          en: "Pupil created successfully!",
          vi: "Tạo học sinh thành công!",
        },
      });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  countAll = async (req, res, next) => {
    try {
      const q = query(collection(db, "pupils"));
      const snapshot = await getCountFromServer(q);
      res.status(200).send({ count: snapshot.data().count });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get all pupils
  getAll = async (req, res, next) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;

      let q;

      if (startAfterId) {
        const startDocRef = doc(db, "pupils", startAfterId);
        const startDocSnap = await getDoc(startDocRef);

        if (!startDocSnap.exists()) {
          return res.status(400).send({
            message: {
              en: "Invalid startAfterId",
              vi: "startAfterId không hợp lệ",
            },
          });
        }

        q = query(
          collection(db, "pupils"),
          orderBy("createdAt", "desc"),
          startAfter(startDocSnap),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "pupils"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const pupilArray = snapshot.docs.map((doc) => Pupil.fromFirestore(doc));

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: pupilArray,
        nextPageToken: lastVisibleId,
      });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get a pupil by ID
  getById = async (req, res, next) => {
    const id = req.params.id;
    const pupil = req.pupil;
    res.status(200).send({ id: id, ...pupil });
  };

  // Get enabled pupils by user ID
  getEnabledPupilByUserId = async (req, res) => {
    try {
      const userId = req.params.userId;
      const pupilsRef = collection(db, "pupils");
      const q = query(
        pupilsRef,
        where("userId", "==", userId),
        where("isDisabled", "==", false)
      );
      const snapshot = await getDocs(q);
      const pupils = snapshot.docs.map((doc) => Pupil.fromFirestore(doc));
      res.status(200).send(pupils);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Update pupil information
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
      // If only isDisabled is provided, update only that field
      if (
        isDisabled !== undefined &&
        Object.keys(data).length === 0 &&
        !dateOfBirth
      ) {
        updateData.isDisabled = isDisabled;
      }
      const pupilRef = doc(db, "pupils", id);
      await updateDoc(pupilRef, updateData);
      res.status(200).send({
        message: {
          en: "Profile information updated successfully!",
          vi: "Cập nhật thông tin hồ sơ thành công!",
        },
      });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Count all pupils
  countPupils = async (req, res, next) => {
    try {
      const pupilSnapshot = await getDocs(collection(db, "pupils"));
      const pupilCount = pupilSnapshot.size;
      res.status(200).send({ count: pupilCount });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Count pupils by grade
  countPupilsByGrade = async (req, res, next) => {
    try {
      const pupilsRef = collection(db, "pupils");
      const q = query(pupilsRef, where("isDisabled", "==", false)); // Chỉ đếm học sinh chưa bị vô hiệu hóa
      const snapshot = await getDocs(q);
      const gradeCounts = {};

      // Duyệt qua các document và đếm theo grade
      snapshot.docs.forEach((doc) => {
        const pupil = Pupil.fromFirestore(doc);
        const grade = pupil.grade;
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
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Count new pupils by month
  countPupilsByMonth = async (req, res, next) => {
    try {
      const { month, year } = req.query; // ví dụ "2024-12"
      if (!month || !/^\d{2}$/.test(month) || !year || !/^\d{4}$/.test(year)) {
        return res
          .status(400)
          .send({ message: "Invalid month format. Use YYYY-MM" });
      }

      const yearNum = parseInt(year);
      const monthIndex = parseInt(month) - 1;

      const currentStart = new Date(yearNum, monthIndex, 1);
      const currentEnd = new Date(yearNum, monthIndex + 1, 1);

      const prevMonthIndex = (monthIndex - 1 + 12) % 12;
      const prevYear = monthIndex === 0 ? yearNum - 1 : yearNum;
      const prevStart = new Date(prevYear, prevMonthIndex, 1);
      const prevEnd = new Date(prevYear, prevMonthIndex + 1, 1);

      const pupilsSnapshot = await getDocs(collection(db, "pupils")); // Sửa lỗi từ "users" thành "pupils"
      let currentMonthCount = 0;
      let previousMonthCount = 0;

      pupilsSnapshot.forEach((docSnap) => {
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
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Count new pupils by week
  countPupilsByWeek = async (req, res, next) => {
    try {
      const { week, year } = req.query; // ví dụ: week=45, year=2025
      if (!week || !/^\d{1,2}$/.test(week) || !year || !/^\d{4}$/.test(year)) {
        return res.status(400).send({
          message: "Invalid week or year format. Use week=WW and year=YYYY",
        });
      }

      const weekNum = parseInt(week);
      const yearNum = parseInt(year);

      const firstDayOfYear = new Date(yearNum, 0, 1);
      const firstMonday = new Date(firstDayOfYear);
      firstMonday.setDate(
        firstDayOfYear.getDate() + ((8 - firstDayOfYear.getDay()) % 7)
      );

      const weekStart = new Date(firstMonday);
      weekStart.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(weekStart.getDate() - 7);
      const prevWeekEnd = new Date(weekStart);

      const pupilsSnapshot = await getDocs(collection(db, "pupils"));
      let currentWeekCount = 0;
      let previousWeekCount = 0;

      pupilsSnapshot.forEach((docSnap) => {
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
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Count new pupils by year
  countPupilsByYear = async (req, res, next) => {
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

      const pupilsSnapshot = await getDocs(collection(db, "pupils"));
      let currentYearCount = 0;
      let previousYearCount = 0;

      pupilsSnapshot.forEach((docSnap) => {
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
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Update image profile
  // uploadImageProfileToS3 = async (req, res, next) => {
  //   try {
  //     const id = req.params.id;
  //     const file = req.file;

  //     if (!file || !file.buffer) {
  //       return res.status(400).json({ message: "No file uploaded" });
  //     }

  //     const fileExt = file.originalname.split(".").pop();
  //     const key = `image_profile/${id}_${uuidv4()}.${fileExt}`;

  //     const command = new PutObjectCommand({
  //       Bucket: process.env.S3_BUCKET_NAME,
  //       Key: key,
  //       Body: file.buffer,
  //       ContentType: file.mimetype,
  //       ACL: "public-read",
  //     });

  //     await s3.send(command);

  //     const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  //     const userRef = doc(db, "pupils", id);
  //     await updateDoc(userRef, {
  //       image: publicUrl,
  //       updatedAt: serverTimestamp(),
  //     });

  //     res.status(200).json({
  //       message: {
  //         en: "Image profile uploaded successfully!",
  //         vi: "Cập nhật ảnh hồ sơ thành công!",
  //       },
  //       image: publicUrl,
  //     });
  //   } catch (error) {
  //     console.error("S3 upload error:", error);
  //     res.status(500).json({
  //       message: {
  //         en: "Upload failed: " + error.message,
  //         vi: "Đẩy ảnh lên S3 không thành công!",
  //       },
  //     });
  //   }
  // };
  uploadImageProfileToS3 = async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!id) {
        return res.status(400).send({ message: "Missing pupil ID." });
      }

      if (!file || !file.buffer) {
        return res.status(400).send({ message: "No file uploaded." });
      }

      const fileExt = file.originalname.split(".").pop();
      const fileKey = `image_profile/pupil_${id}_${uuidv4()}.${fileExt}`;
      await FileController.uploadFile(file, fileKey);

      const imageUrl = `${process.env.CLOUD_FRONT}${fileKey}`;

      const pupilRef = doc(db, "pupils", id);
      await updateDoc(pupilRef, {
        image: imageUrl,
        updatedAt: serverTimestamp(),
      });

      return res.status(200).send({
        message: {
          en: "Pupil profile image uploaded successfully!",
          vi: "Cập nhật ảnh hồ sơ học sinh thành công!",
        },
        image: imageUrl,
      });
    } catch (error) {
      console.error("Upload image profile error:", error);
      return res.status(500).send({
        message: {
          en: error.message || "Upload failed.",
          vi: "Đã xảy ra lỗi khi cập nhật ảnh hồ sơ học sinh.",
        },
      });
    }
  };
}

module.exports = new PupilController();
