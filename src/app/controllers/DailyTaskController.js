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
  // Create daily task
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "daily_tasks"), {
        ...data,
        isDisabled: false,
        createdAt: serverTimestamp(),
      });
      res.status(201).send({
        message: {
          en: "Daily task created successfully!",
          vi: "Tạo nhiệm vụ hằng ngày thành công!",
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

  // Get all daily tasks
  getAll = async (req, res, next) => {
    try {
      const dailyTaskSnapshot = await getDocs(collection(db, "daily_tasks"));
      const dailyTasks = dailyTaskSnapshot.docs.map((doc) =>
        DailyTask.fromFirestore(doc)
      );
      res.status(200).send(dailyTasks);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get enable daily tasks
  getEnabledDailyTask = async (req, res, next) => {
    try {
      const q = query(
        collection(db, "daily_tasks"),
        where("isDisabled", "==", false)
      );
      const dailyTasks = await getDocs(q);
      const dailyTaskArray = dailyTasks.docs.map((doc) =>
        DailyTask.fromFirestore(doc)
      );
      res.status(200).send(dailyTaskArray);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get a daily task by ID
  getById = async (req, res, next) => {
    const id = req.params.id;
    const dailyTask = req.dailyTask;
    res.status(200).send({ id: id, ...dailyTask });
  };

  // Update daily task
  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { createdAt, ...data } = req.body;
      const ref = doc(db, "daily_tasks", id);
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
      res.status(200).send({
        message: {
          en: "Daily task updated successfully!",
          vi: "Cập nhật nhiệm vụ hằng ngày thành công!",
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

module.exports = new DailyTaskController();
