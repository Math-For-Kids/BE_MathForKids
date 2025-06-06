const GeneralNotification = require("../models/GeneralNotification");
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
  orderBy,
} = require("firebase/firestore");

const db = getFirestore();

class GeneralNotificationController {
  // Create general notification
  create = async (req, res, next) => {
    try {
      const data = req.body;
      const newDocRef = await addDoc(collection(db, "general_notifications"), {
        ...data,
        createdAt: serverTimestamp(),
      });
      res.status(201).send({
        message: {
          en: "General notification created successfully!",
          vi: "Tạo thông báo chung thành công!",
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

  getAll = async (req, res, next) => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "general_notifications")
      );
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push(GeneralNotification.fromFirestore(doc));
      });
      res.status(200).send(notifications);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  getAllWithin30Days = async (req, res, next) => {
    try {
      const thirtyDaysAgo = Timestamp.fromDate(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      const q = query(
        collection(db, "general_notifications"),
        where("createdAt", ">=", thirtyDaysAgo),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push(GeneralNotification.fromFirestore(doc));
      });
      res.status(200).send(notifications);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get general notification by ID
  getById = async (req, res, next) => {
    const id = req.params.id;
    const generalNotification = req.generalNotification;
    res.status(200).send({ id: id, ...generalNotification });
  };
}

module.exports = new GeneralNotificationController();
