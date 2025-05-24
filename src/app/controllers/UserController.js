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
  create = async (req, res, next) => {
    try {
      const data = req.body;
      const existUser = await checkUserExist(data.phoneNumber, null);
      if (existUser) {
        res.status(200).send({ message: "User created successfully!" });
      } else {
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
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const user = doc(db, "users", id);
      await updateDoc(user, { ...data, updatedAt: serverTimestamp() });
      res.status(200).send({ message: "User updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new UserController();
