const Level = require("../models/Level");
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

class LevelController {
  // Create level
  create = async (req, res) => {
    try {
      const data = req.body;
      const newDocRef = await addDoc(collection(db, "levels"), {
        ...data,
        isDisabled: false,
        createdAt: serverTimestamp(),
      });
      res.status(201).send({
        message: {
          en: "Level created successfully!",
          vi: "Tạo cấp độ thành công!",
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

  // Get all levels
  getAll = async (req, res) => {
    try {
      const snapshot = await getDocs(collection(db, "levels"));
      const levels = snapshot.docs.map((doc) => Level.fromFirestore(doc));
      res.status(200).send(levels);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get enabled levels
  getEnabledLevels = async (req, res) => {
    try {
      const levelsRef = collection(db, "levels");
      const q = query(levelsRef, where("isDisabled", "==", false));
      const snapshot = await getDocs(q);
      const levels = snapshot.docs.map((doc) => Level.fromFirestore(doc));
      res.status(200).send(levels);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get level by ID
  getById = async (req, res) => {
    const id = req.params.id;
    const level = req.level;
    res.status(200).send({ id: id, ...level });
  };

  // Update level
  update = async (req, res) => {
    try {
      const levelId = req.params.id;
      const data = req.body;
      const docRef = doc(db, "levels", levelId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({
        message: {
          en: "Level updated successfully!",
          vi: "Cập nhật cấp độ thành công!",
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
}

module.exports = new LevelController();
