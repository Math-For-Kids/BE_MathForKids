const DailyTask = require("../models/DailyTask");
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

class DailyTaskController {
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "daily_tasks"), {
        ...data,
        isDisabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Daily Task created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  getAll = async (req, res, next) => {
    try {
      const dailyTaskSnapshot = await getDocs(collection(db, "daily_tasks"));
      const dailyTasks = dailyTaskSnapshot.docs.map((doc) =>
        DailyTask.fromFirestore(doc)
      );
      res.status(200).send(dailyTasks);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  getByExercise = async (req, res, next) => {
    try {
      const exerciseId = req.params.exerciseId;
      const q = query(
        collection(db, "daily_tasks"),
        where("exerciseId", "==", exerciseId)
      );
      const dailyTasks = await getDocs(q);
      const result = dailyTasks.docs.map((doc) => DailyTask.fromFirestore(doc));
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const ref = doc(db, "daily_tasks", id);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) {
        return res.status(404).send({ message: "DailyTask not found!" });
      }
      const dailyTask = DailyTask.fromFirestore(docSnap);
      res.status(200).send(dailyTask);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const ref = doc(db, "daily_tasks", id);
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
      res.status(200).send({ message: "DailyTask updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      await deleteDoc(doc(db, "daily_tasks", id));
      res.status(200).send({ message: "DailyTask deleted successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new DailyTaskController();
