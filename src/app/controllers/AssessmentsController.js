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
  query,
  where
} = require("firebase/firestore");

const db = getFirestore();
const { uploadMultipleFiles } = require("./fileController");

class AssessmentController {


  create = async (req, res, next) => {
    try {
      const {
        levelId,
        grade,
        type,
        question,
        option,
        answer,
      } = req.body;

      const uploadedFiles = req.files ? await uploadMultipleFiles(req.files) : {};

      const image = uploadedFiles["image"] || null;
      let parsedOption = Array.isArray(option)
        ? option
        : JSON.parse(option); // Nếu front-end gửi dạng JSON string

      parsedOption = parsedOption.map((opt, index) => {
        // Nếu option là image thì gán URL ảnh
        if (opt === "__image__" && uploadedFiles[`option_${index}`]) {
          return uploadedFiles[`option_${index}`];
        }
        return opt;
      });

      // Xử lý answer – có thể là text hoặc ảnh
      let finalAnswer = answer;
      if (answer === "__image__" && (uploadedFiles["answer"] || uploadedFiles["answerImage"])) {
        finalAnswer = uploadedFiles["answer"] || uploadedFiles["answerImage"];
      }
      await addDoc(collection(db, "assessments"), {
        ...data,
        isDisabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      res.status(201).send({ message: "Assessment created successfully!" });
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

  getEnabledAssessment = async (req, res) => {
    try {
      const assessmentsRef = collection(db, "assessments");
      const q = query(assessmentsRef, where("isDisabled", "==", false));
      const snapshot = await getDocs(q);
      const assessments = snapshot.docs.map(doc => Assessment.fromFirestore(doc));
      res.status(200).send(assessments);
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
