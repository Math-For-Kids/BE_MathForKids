const Exercise = require("../models/Exercise");
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
const { uploadMultipleFiles } = require("./fileController");

const db = getFirestore();

class ExerciseController {
  create = async (req, res, next) => {
    try {
      const { levelId, lessonId, question, option: textOption, answer: textAnswer } = req.body;
      // Parse JSON fields
      const parsedQuestion = JSON.parse(question);
      // Upload files and get image, option, and answer
      const { image, option, answer } = await uploadMultipleFiles(req.files, textOption, textAnswer);

      // Prepare assessment data
      const exercisesRef = await addDoc(collection(db, "exercises"), {
        levelId,
        lessonId,
        question: parsedQuestion,
        option, // Array of text or image URLs
        answer,
        image,
        isDisabled: false,
        createdAt: serverTimestamp(),
        // updatedAt: serverTimestamp(),
      });

      res.status(201).send({
        message: "Exercises created successfully!",
        data: exercisesRef.id,
      });
    } catch (error) {
      console.error("Error in create:", error.message);
      res.status(500).send({ message: error.message });
    }
  };

  getAll = async (req, res, next) => {
    try {
      const exercises = await getDocs(collection(db, "exercises"));
      const exerciseArray = exercises.docs.map((doc) => Exercise.fromFirestore(doc));
      res.status(200).send(exerciseArray);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  getByLesson = async (req, res, next) => {
    try {
      const lessonId = req.params.lessonId;
      const q = query(
        collection(db, "exercises"),
        where("lessonId", "==", lessonId)
      );
      const exercises = await getDocs(q);
      const exerciseArray = exercises.docs.map((doc) =>
        Exercise.fromFirestore(doc)
      );
      res.status(200).send(exerciseArray);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  getEnabledByLesson = async (req, res, next) => {
    try {
      const lessonId = req.params.lessonId;
      const q = query(
        collection(db, "exercises"),
        where("lessonId", "==", lessonId),
        where("isDisabled", "==", false)
      );
      const exercises = await getDocs(q);
      const exerciseArray = exercises.docs.map((doc) =>
        Exercise.fromFirestore(doc)
      );
      res.status(200).send(exerciseArray);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const exercise = doc(db, "exercises", id);
      const data = await getDoc(exercise);
      const exerciseData = Exercise.fromFirestore(data);
      if (data.exists()) {
        res.status(200).send(exerciseData);
      } else {
        res.status(404).send({ message: "Exercise not found!" });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const exercisesRef = doc(db, "exercises", id);
      const docSnapshot = await getDoc(exercisesRef);

      if (!docSnapshot.exists()) {
        return res.status(404).send({ message: "Exercises not found!" });
      }
      const oldData = docSnapshot.data();
      const { levelId, lessonId, question, option: textOption, answer: textAnswer, isDisabled } = req.body;
      let parsedQuestion, parsedOption, parsedAnswer;
      try {
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
        lessonId,
        question: parsedQuestion,
        option: finalOption,
        answer: finalAnswer,
        image: finalImage,
        isDisabled,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(exercisesRef, updateData);
      res.status(200).send({ message: "Exercises updated successfully!" });
    } catch (error) {
      console.error("Error in update:", error.message);
      res.status(500).send({ message: error.message });
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { createdAt, ...data } = req.body;
      const exercisesRef = doc(db, "exercises", id);
      await updateDoc(exercisesRef, { ...data, updatedAt: serverTimestamp() });
      res.status(200).send({ message: "Exercises disabled successfully!" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };
}

module.exports = new ExerciseController();
