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
} = require("firebase/firestore");

const db = getFirestore();

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

class UserController {
  getAll = async (req, res, next) => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.status(200).send(users);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const usersRef = doc(db, "users", id);
      const data = await getDoc(usersRef);
      if (data.exists()) {
        const userData = User.fromFirestore(data);
        res.status(200).send(userData);
      } else {
        res.status(404).send({ message: "User not found!" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getEnabledUsers = async (req, res) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("isDisabled", "==", false));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => User.fromFirestore(doc));
      res.status(200).send(users);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  create = async (req, res, next) => {
    try {
      const data = req.body;
      const date = new Date(data.dateOfBirth); // Chuyển chuỗi sang Date
      const dateOfBirthTimestamp = Timestamp.fromDate(date); // Chuyển sang Timestamp
      const userData = {
        ...data,
        dateOfBirth: dateOfBirthTimestamp,
        role: 'user',
        isVerify: false,
        otpCode: '',
        otpExpiration: null,
        volume: 100,
        language: 'en',
        mode: 'light',
        isDisabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'users'), userData); // Get document reference
      res.status(200).send({
        message: 'User created successfully!',
        id: docRef.id, // Include the document ID
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

      const pupilQuery = query(collection(db, "pupils"), where("userId", "==", id));
      const pupilSnapshot = await getDocs(pupilQuery);

      const batch = writeBatch(db);
      pupilSnapshot.forEach(docSnap => {
        const pupilRef = doc(db, "pupils", docSnap.id);
        batch.update(pupilRef, {
          ...data, updatedAt: serverTimestamp()
        });
      });

      await batch.commit();

      res.status(200).send({ message: "User and related pupils disabled successfully!" });
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

      usersSnapshot.forEach(docSnap => {
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
    }
  };
}

module.exports = new UserController();
