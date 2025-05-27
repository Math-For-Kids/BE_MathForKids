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
      const { month } = req.query; // ví dụ "2024-12"
      if (!month || !/^\d{2}$/.test(month)) {
        return res.status(400).send({ message: "Invalid month format. Use YYYY-MM" });
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

      pupilsSnapshot.forEach(docSnap => {
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
}

module.exports = new PupilController();
