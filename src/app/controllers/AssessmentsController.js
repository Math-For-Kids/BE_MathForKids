const Assessment = require("../models/Assessment");
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

class AssessmentController {

  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "assessments"), {
        ...data,
        isDisabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Assessment created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getAll = async (req, res, next) => {
    try {
      const assessments = await getDocs(collection(db, "assessments"));
      const assessmentArray = assessments.docs.map((doc) => Assessment.fromFirestore(doc));
      res.status(200).send(assessmentArray);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const assessmentRef = doc(db, "assessments", id);
      const data = await getDoc(assessmentRef);
      if (data.exists()) {
        const assessmentData = Assessment.fromFirestore(data);
        res.status(200).send(assessmentData);
      } else {
        res.status(404).send({ message: "Assessment not found!" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const assessmentRef = doc(db, "assessments", id);
      await updateDoc(assessmentRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Assessment updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      await deleteDoc(doc(db, "assessments", id));
      res.status(200).send({ message: "Assessment deleted successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new AssessmentController();
