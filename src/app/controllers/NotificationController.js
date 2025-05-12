const Notification = require("../models/Notification");
const {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} = require("firebase/firestore");

const db = getFirestore();

class NotificationController {
  
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "notifications"), {
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
      const notifications = await getDocs(collection(db, "notifications"));
      const notificationArray = notifications.docs.map((doc) =>
        Notification.fromFirestore(doc)
      );
      res.status(200).send(notificationArray);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };


  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const notificationRef = doc(db, "notifications", id);
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

  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      await deleteDoc(doc(db, "notifications", id));
      res.status(200).send({ message: "Notification deleted successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new NotificationController();
