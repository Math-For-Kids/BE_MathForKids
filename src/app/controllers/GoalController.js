const Goal = require("../models/Goal");
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

class GoalController {
  // Create goal
  create = async (req, res, next) => {
    try {
      const data = req.body;
      const goalData = {
        ...data,
        isCompleted: false,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "goal"), goalData);
      res.status(201).send({
        message: {
          en: "Goal created successfully!",
          vi: "Tạo mục tiêu thành công!",
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

  // Get goals within 30 days by pupil ID
  getWithin30DaysByPupilId = async (req, res, next) => {
    try {
      const pupilId = req.params.pupilId;
      // Tính timestamp 30 ngày trước
      const thirtyDaysAgo = Timestamp.fromDate(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      const q = query(
        collection(db, "goal"),
        where("pupilId", "==", pupilId),
        where("createdAt", ">=", thirtyDaysAgo),
        orderBy("createdAt", "desc")
      );
      const goalSnapshot = await getDocs(q);
      const goals = goalSnapshot.docs.map((doc) => Goal.fromFirestore(doc));
      res.status(200).send(goals);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get a goal by ID
  getById = async (req, res, next) => {
    const id = req.params.id;
    const goal = req.goal;
    res.status(200).send({ id: id, ...goal });
  };

  // Update goal
  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const ref = doc(db, "goal", id);
      await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({
        message: {
          en: "Goal updated successfully!",
          vi: "Cập nhật mục tiêu thành công!",
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

module.exports = new GoalController();
