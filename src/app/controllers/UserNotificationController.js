const UserNotification = require("../models/UserNotification");
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

class UserNotificationController {
  create = async (req, res, next) => {
    try {
      const { userId, title, content, isRead } = req.body;
      const notificationData = {
        userId,
        title,
        content,
        isRead: isRead ?? false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(collection(db, "user_notifications"), notificationData);
      res
        .status(200)
        .send({ message: "User notification created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };


  getAll = async (req, res, next) => {
    try {
      const notificationSnapshot = await getDocs(
        collection(db, "user_notifications")
      );
      const notifications = notificationSnapshot.docs.map((doc) =>
        UserNotification.fromFirestore(doc)
      );
      res.status(200).send(notifications);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  
  getByUserId = async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const q = query(
        collection(db, "user_notifications"),
        where("userId", "==", userId)
      );
      const notificationSnapshot = await getDocs(q);
      const notifications = notificationSnapshot.docs.map((doc) =>
        UserNotification.fromFirestore(doc)
      );
      res.status(200).send(notifications);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const ref = doc(db, "user_notifications", id);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) {
        return res
          .status(404)
          .send({ message: "User notification not found!" });
      }
      const notification = UserNotification.fromFirestore(docSnap);
      res.status(200).send(notification);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { userId, title, content, isRead } = req.body;
      const ref = doc(db, "user_notifications", id);
      await updateDoc(ref, {
        userId,
        title,
        content,
        isRead,
        updatedAt: serverTimestamp(),
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
      await deleteDoc(doc(db, "user_notifications", id));
      res
        .status(200)
        .send({ message: "User notification deleted successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new UserNotificationController();
