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
      const { levelId, grade, type, question, option: textOption, answer: textAnswer } = req.body;
      // Parse JSON fields
      const parsedType = JSON.parse(type);
      const parsedQuestion = JSON.parse(question);

      // Upload files and get image, option, and answer
      const { image, option, answer } = await uploadMultipleFiles(req.files, textOption, textAnswer);

      // Prepare assessment data
      const assessmentRef = await addDoc(collection(db, "assessments"), {
        levelId,
        grade: parseInt(grade),
        type: parsedType,
        question: parsedQuestion,
        option, // Array of text or image URLs
        answer,
        image,
        isDisabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      res.status(201).send({
        message: "Assessment created successfully!",
        data: assessmentRef.id,
      });
    } catch (error) {
      console.error("Error in create:", error.message);
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
      const assessmentRef = doc(db, "assessments", id);
      const docSnapshot = await getDoc(assessmentRef);

      if (!docSnapshot.exists()) {
        return res.status(404).send({ message: "Assessment not found!" });
      }
      const oldData = docSnapshot.data();
      const { levelId, grade, type, question, option: textOption, answer: textAnswer } = req.body;
      let parsedType, parsedQuestion, parsedOption, parsedAnswer;
      try {
        parsedType = JSON.parse(type);
        parsedQuestion = JSON.parse(question);
        parsedOption = textOption ? JSON.parse(textOption) : null;
        parsedAnswer = textAnswer || null;
      } catch (error) {
        return res.status(400).send({ message: "Invalid JSON format for type, question, option, or answer!" });
      }
      const { image, option: uploadedOption, answer: uploadedAnswer } = await uploadMultipleFiles(
        req.files,
        parsedOption,
        parsedAnswer
      );

      const finalOption =
        (uploadedOption && uploadedOption.length > 0) ? uploadedOption :
          (parsedOption && parsedOption.length > 0) ? parsedOption :
            oldData.option;

      const finalAnswer = uploadedAnswer ?? parsedAnswer ?? oldData.answer;
      const finalImage = image ?? oldData.image;

      const updateData = {
        levelId,
        grade: parseInt(grade),
        type: parsedType,
        question: parsedQuestion,
        option: finalOption,
        answer: finalAnswer,
        image: finalImage,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(assessmentRef, updateData);
      res.status(200).send({ message: "Assessment updated successfully!" });
    } catch (error) {
      console.error("Error in update:", error.message);
      res.status(400).send({ message: error.message });
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { createdAt, ...data } = req.body;
      const assessmentRef = doc(db, "assessments", id);
      await updateDoc(assessmentRef, { ...data, updatedAt: serverTimestamp() });
      res.status(200).send({ message: "Assessments disabled successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new AssessmentController();
