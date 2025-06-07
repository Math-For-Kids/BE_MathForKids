const PupilNotification = require("../models/PupilNotification");
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
  Timestamp,
  where,
  query,
  orderBy,
} = require("firebase/firestore");

const db = getFirestore();

class PupilNotificationController {
  // Create pupil notification
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "pupil_notifications"), {
        ...data,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      res.status(201).send({
        message: {
          en: "Pupil notification created successfully!",
          vi: "Tạo thông báo cho học sinh thành công!",
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

  // Get pupil notifications within 30 days by pupil ID
  getWithin30DaysByPupilId = async (req, res, next) => {
    try {
      const pupilId = req.params.pupilId;
      const thirtyDaysAgo = Timestamp.fromDate(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      const q = query(
        collection(db, "pupil_notifications"),
        where("pupilId", "==", pupilId),
        where("createdAt", ">=", thirtyDaysAgo),
        orderBy("createdAt", "desc")
      );
      const notificationSnapshot = await getDocs(q);
      const notifications = notificationSnapshot.docs.map((doc) =>
        PupilNotification.fromFirestore(doc)
      );
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

  // Get pupil notification by ID
  getById = async (req, res, next) => {
    const id = req.params.id;
    const pupilNotification = req.pupilNotification;
    res.status(200).send({ id: id, ...pupilNotification });
  };

  updateStatus = async (req, res, next) => {
    try {
      const id = req.params.id;
      const ref = doc(db, "pupil_notifications", id);
      await updateDoc(ref, { isRead: true });
      res.status(200).send({
        message: {
          en: "Pupil notification status updated successfully!",
          vi: "Trạng thái thông báo của học sinh đã cập nhật thành công!",
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

module.exports = new PupilNotificationController();
