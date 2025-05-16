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
} = require("firebase/firestore");

const db = getFirestore();

class GeneralNotificationController {

  create = async (req, res) => {
    try {
      const data = req.body;
      const newDocRef = await addDoc(collection(db, "general_notifications"), {
        ...data,
        isRead: data.isRead ?? false,
        createdAt: serverTimestamp(),
      });
      const newDocSnapshot = await getDoc(newDocRef);
      const notification = GeneralNotification.fromFirestore(newDocSnapshot);
      res.status(200).send(notification);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getAll = async (req, res) => {
    try {
      const querySnapshot = await getDocs(collection(db, "general_notifications"));
      const notifications = [];
      querySnapshot.forEach(doc => {
        notifications.push(GeneralNotification.fromFirestore(doc));
      });
      res.status(200).send(notifications);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const id = req.params.id;
      const docRef = doc(db, "general_notifications", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const notification = GeneralNotification.fromFirestore(docSnap);
        res.status(200).send(notification);
      } else {
        res.status(404).send({ message: "Notification not found!" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  update = async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const docRef = doc(db, "general_notifications", id);
      await updateDoc(docRef, {
        ...data
      });
      const updatedDoc = await getDoc(docRef);
      const notification = GeneralNotification.fromFirestore(updatedDoc);
      res.status(200).send(notification);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const id = req.params.id;
      const docRef = doc(db, "general_notifications", id);
      await deleteDoc(docRef);
      res.status(200).send({ message: "Notification deleted successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new GeneralNotificationController();
