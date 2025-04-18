const Exercise = require("../models/Exercise");
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

class ExerciseController {
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "exercises"), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Exercise created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getByLesson = async (req, res, next) => {
    try {
      const lessonId = req.params.lessonId;
      const q = query(
        collection(db, "exercises"),
        where("lessonId", "==", lessonId)
      );
      const exercises = await getDocs(q);
      const exerciseArray = exercises.docs.map((doc) =>
        Exercise.fromFirestore(doc)
      );
      res.status(200).send(exerciseArray);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const exercise = doc(db, "exercises", id);
      const data = await getDoc(exercise);
      const exerciseData = Exercise.fromFirestore(data);
      if (data.exists()) {
        res.status(200).send(exerciseData);
      } else {
        res.status(404).send({ message: "Exercise not found!" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const exercise = doc(db, "exercises", id);
      await updateDoc(exercise, { ...data, updatedAt: serverTimestamp() });
      res.status(200).send({ message: "Exercise updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      await deleteDoc(doc(db, "exercises", id));
      res.status(200).send({ message: "Exercise deleted successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new ExerciseController();
