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
  serverTimestamp,
  query,
  where
} = require("firebase/firestore");

const db = getFirestore();

class TestQuestionController {
  create = async (req, res, next) => {
    try {
      const { levelId, testId, level, question, option: textOption, correctAnswer: textAnswer, selectedAnswer: textSelectedAnswer } = req.body;

      const parsedQuestion = JSON.parse(question);

      const { image, option, correctAnswer, selectedAnswer } = await uploadMultipleFiles(req.files, textOption, textAnswer, textSelectedAnswer);

      const testQuestionRef = await addDoc(collection(db, "testquestions"), {
        levelId,
        testId,
        level,
        question: parsedQuestion,
        option, // Array of text or image URLs
        correctAnswer,
        selectedAnswer,
        image,
        isDisabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      res.status(201).send({
        message: "Test question created successfully!",
        data: testQuestionRef.id,
      });
    } catch (error) {
      console.error("Error in create:", error.message);
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

  getEnabledTestQuestion = async (req, res) => {
    try {
      const testQuestionsRef = collection(db, "testquestions");
      const q = query(testQuestionsRef, where("isDisabled", "==", false));
      const snapshot = await getDocs(q);
      const testQuestions = snapshot.docs.map(doc => TestQuestion.fromFirestore(doc));
      res.status(200).send(testQuestions);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}



module.exports = new TestQuestionController();
