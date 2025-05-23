const Lesson = require("../models/Lesson");
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

class LessonController {
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "lessons"), {
        ...data,
        isDisabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Lesson created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getAll = async (req, res, next) => {
    try {
      const lessons = await getDocs(collection(db, "lessons"));
      const lessonArray = lessons.docs.map((doc) => Lesson.fromFirestore(doc));
      res.status(200).send(lessonArray);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getByGrade = async (req, res, next) => {
    try {
      const grade = parseInt(req.params.grade);
      const q = query(collection(db, "lessons"), where("grade", "==", grade));
      const lessons = await getDocs(q);
      const lessonArray = lessons.docs.map((doc) => Lesson.fromFirestore(doc));
      res.status(200).send(lessonArray);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const lesson = doc(db, "lessons", id);
      const data = await getDoc(lesson);
      const lessonData = Lesson.fromFirestore(data);
      if (data.exists()) {
        res.status(200).send(lessonData);
      } else {
        res.status(404).send({ message: "Lesson not found!" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { createdAt, ...data } = req.body;
      const lesson = doc(db, "lessons", id);
      await updateDoc(lesson, { ...data, updatedAt: serverTimestamp() });
      res.status(200).send({ message: "Lesson updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      await deleteDoc(doc(db, "lessons", id));
      res.status(200).send({ message: "Lesson deleted successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
 countLessons = async (req, res, next) => {
  try {
    const q = query(collection(db, "lessons"), where("isDisabled", "==", false));
    const snapshot = await getDocs(q);
    const count = snapshot.size;

    res.status(200).send({ count: count });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

}

module.exports = new LessonController();