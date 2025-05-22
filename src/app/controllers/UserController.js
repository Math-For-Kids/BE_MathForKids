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

  create = async (req, res, next) => {
    try {
      const data = req.body;
      const date = new Date(data.dateOfBirth); // Chuyển chuỗi sang Date
      const dateOfBirthTimestamp = Timestamp.fromDate(date); // Chuyển sang Timestamp
      await addDoc(collection(db, "users"), {
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "User created successfully!" });
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

      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

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
      const usersSnapshot = await getDocs(collection(db, "users"));
      const monthlyCount = {};

      usersSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        const createdAt = data.createdAt;

        if (createdAt && createdAt.toDate) {
          const date = createdAt.toDate(); // Convert Timestamp to JS Date
          const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!monthlyCount[yearMonth]) {
            monthlyCount[yearMonth] = 0;
          }
          monthlyCount[yearMonth]++;
        }
      });

      res.status(200).send(monthlyCount);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new UserController();
