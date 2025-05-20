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
} = require("firebase/firestore");

const db = getFirestore();

class UserController {
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "users"), {
        ...data,
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
      next();
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
