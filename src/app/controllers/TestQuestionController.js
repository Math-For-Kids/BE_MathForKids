const TestQuestion = require("../models/TestQuestions");
const {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp
} = require("firebase/firestore");

const db = getFirestore();

class TestQuestionController {

  create = async (req, res) => {
    try {
      const data = req.body;
      const newDocRef = await addDoc(collection(db, "testquestions"), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const newDocSnapshot = await getDoc(newDocRef);
      const testQuestion = TestQuestion.fromFirestore(newDocSnapshot);
      res.status(200).send(testQuestion);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  update = async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const docRef = doc(db, "testquestions", id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      const updatedDoc = await getDoc(docRef);
      const testQuestion = TestQuestion.fromFirestore(updatedDoc);
      res.status(200).send(testQuestion);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const id = req.params.id;
      await deleteDoc(doc(db, "testquestions", id));
      res.status(200).send({ message: "TestQuestion deleted successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const id = req.params.id;
      const docRef = doc(db, "testquestions", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const testQuestion = TestQuestion.fromFirestore(snapshot);
        res.status(200).send(testQuestion);
      } else {
        res.status(404).send({ message: "TestQuestion not found!" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getAll = async (req, res) => {
    try {
      const snapshot = await getDocs(collection(db, "testquestions"));
      const list = snapshot.docs.map(doc => TestQuestion.fromFirestore(doc));
      res.status(200).send(list);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new TestQuestionController();
