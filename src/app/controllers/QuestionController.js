const Question = require("../models/Question");
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

class QuestionController {
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "questions"), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Question created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getByExercise = async (req, res, next) => {
    try {
      const exerciseId = req.params.exerciseId;
      const q = query(
        collection(db, "questions"),
        where("exerciseId", "==", exerciseId)
      );
      const questions = await getDocs(q);
      const questionArray = questions.docs.map((doc) =>
        Question.fromFirestore(doc)
      );
      res.status(200).send(questionArray);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const question = doc(db, "questions", id);
      const data = await getDoc(question);
      const questionData = Question.fromFirestore(data);
      if (data.exists()) {
        res.status(200).send(questionData);
      } else {
        res.status(404).send({ message: "Question not found!" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const question = doc(db, "questions", id);
      await updateDoc(question, { ...data, updatedAt: serverTimestamp() });
      res.status(200).send({ message: "Question updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      await deleteDoc(doc(db, "questions", id));
      res.status(200).send({ message: "Question deleted successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new QuestionController();
