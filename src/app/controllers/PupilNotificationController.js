const Notification = require("../models/PupilNotification");
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
  where,
  query,
} = require("firebase/firestore");

const db = getFirestore();

class PupilNotificationController {
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "pupil_notifications"), {
        ...data,
        isRead: data.isRead ?? false,
        createdAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Notification created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getAll = async (req, res, next) => {
    try {
      const pupil_notifications = await getDocs(
        collection(db, "pupil_notifications")
      );
      const notificationArray = pupil_notifications.docs.map((doc) =>
        Notification.fromFirestore(doc)
      );
      res.status(200).send(notificationArray);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getByPupilId = async (req, res, next) => {
    try {
      const pupilId = req.params.pupilId;
      const q = query(
        collection(db, "pupil_notifications"),
        where("pupilId", "==", pupilId)
      );
      const notificationSnapshot = await getDocs(q);
      const notifications = notificationSnapshot.docs.map((doc) =>
        Notification.fromFirestore(doc)
      );
      res.status(200).send(notifications);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const notificationRef = doc(db, "pupil_notifications", id);
      const data = await getDoc(notificationRef);
      if (data.exists()) {
        const notification = Notification.fromFirestore(data);
        res.status(200).send(notification);
      } else {
        res.status(404).send({ message: "Notification not found!" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { pupilId, title, content, isRead } = req.body;
      const ref = doc(db, "pupil_notifications", id);
      await updateDoc(ref, {
        pupilId,
        title,
        content,
        isRead,
        // updatedAt: serverTimestamp(),
      });
      res
        .status(200)
        .send({ message: "User notification updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      await deleteDoc(doc(db, "pupil_notifications", id));
      res.status(200).send({ message: "Notification deleted successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
 
}

module.exports = new PupilNotificationController();
