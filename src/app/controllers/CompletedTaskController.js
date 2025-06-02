const CompleteTask = require("../models/CompletedTask");
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

class CompleteTaskController {
  create = async (req, res, next) => {
    try {
      const { pupilId, taskId, lessonId, isCompleted } = req.body;
      const taskData = {
        pupilId,
        taskId,
        lessonId,
        isCompleted: isCompleted ?? false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(collection(db, "complete_tasks"), taskData);
      res.status(200).send({ message: "Complete task created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  getAll = async (req, res, next) => {
    try {
      const taskSnapshot = await getDocs(collection(db, "complete_tasks"));
      const tasks = taskSnapshot.docs.map((doc) =>
        CompleteTask.fromFirestore(doc)
      );
      res.status(200).send(tasks);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  getByStudentId = async (req, res, next) => {
    try {
      const studentId = req.params.studentId;
      const q = query(
        collection(db, "complete_tasks"),
        where("studentId", "==", studentId)
      );
      const taskSnapshot = await getDocs(q);
      const tasks = taskSnapshot.docs.map((doc) =>
        CompleteTask.fromFirestore(doc)
      );
      res.status(200).send(tasks);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const ref = doc(db, "complete_tasks", id);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) {
        return res.status(404).send({ message: "Complete task not found!" });
      }
      const task = CompleteTask.fromFirestore(docSnap);
      res.status(200).send(task);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { studentId, taskId, isCompleted } = req.body;
      const ref = doc(db, "complete_tasks", id);
      await updateDoc(ref, {
        studentId,
        taskId,
        isCompleted,
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Complete task updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      await deleteDoc(doc(db, "complete_tasks", id));
      res.status(200).send({ message: "Complete task deleted successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new CompleteTaskController();
