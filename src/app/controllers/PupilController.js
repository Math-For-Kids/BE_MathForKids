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
      const pupils = snapshot.docs.map(doc => Pupil.fromFirestore(doc));
      res.status(200).send(pupils);
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
      // If only isDisabled is provided, update only that field
      if (isDisabled !== undefined && Object.keys(data).length === 0 && !dateOfBirth) {
        updateData.isDisabled = isDisabled;
      }
      const pupilRef = doc(db, "pupils", id);
      await updateDoc(pupilRef, updateData);
      res.status(200).send({ message: "Pupil updated successfully!" });
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
      const gradeCounts = {};
      snapshot.docs.forEach(doc => {
        const pupil = Pupil.fromFirestore(doc);
        const grade = pupil.grade;
        if (grade) {
          gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
        }
      });
      const result = Object.keys(gradeCounts).map(grade => ({
        grade,
        count: gradeCounts[grade]
      }));

      res.status(200).send(result);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  countPupilsByMonth = async (req, res, next) => {
    try {
      const { month, year } = req.query; // ví dụ "2024-12"
      if (!month || !/^\d{2}$/.test(month) || !year || !/^\d{4}$/.test(year)) {
        return res.status(400).send({ message: "Invalid month format. Use YYYY-MM" });
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

      pupilsSnapshot.forEach(docSnap => {
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

  countPupilsByWeek = async (req, res, next) => {
    try {
      const { week, year } = req.query; // ví dụ: week=45, year=2025
      if (!week || !/^\d{1,2}$/.test(week) || !year || !/^\d{4}$/.test(year)) {
        return res.status(400).send({ message: "Invalid week or year format. Use week=WW and year=YYYY" });
      }

      const weekNum = parseInt(week);
      const yearNum = parseInt(year);

      const firstDayOfYear = new Date(yearNum, 0, 1);
      const firstMonday = new Date(firstDayOfYear);
      firstMonday.setDate(firstDayOfYear.getDate() + ((8 - firstDayOfYear.getDay()) % 7));

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

      pupilsSnapshot.forEach(docSnap => {
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
  
  countPupilsByYear = async (req, res, next) => {
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

      const pupilsSnapshot = await getDocs(collection(db, "pupils"));
      let currentYearCount = 0;
      let previousYearCount = 0;

      pupilsSnapshot.forEach(docSnap => {
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
}

module.exports = new PupilController();
