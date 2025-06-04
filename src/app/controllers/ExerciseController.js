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
      const parsedQuestion = JSON.parse(question);
      const { image, option, answer } = await uploadMultipleFiles(req.files, textOption, textAnswer);
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

  getEnabledExercises = async (req, res) => {
    try {
      const exercisesRef = collection(db, "exercises");
      const q = query(exercisesRef, where("isDisabled", "==", false));
      const snapshot = await getDocs(q);
      const exercises = snapshot.docs.map(doc => Exercise.fromFirestore(doc));
      res.status(200).send(exercises);
    } catch (error) {
      res.status(400).send({ message: error.message });
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

  // update = async (req, res, next) => {
  //   try {
  //     const id = req.params.id;
  //     const exercisesRef = doc(db, "exercises", id);
  //     const docSnapshot = await getDoc(exercisesRef);

  //     if (!docSnapshot.exists()) {
  //       return res.status(404).send({ message: "Exercise not found!" });
  //     }
  //     const oldData = docSnapshot.data();
  //     const { levelId, lessonId, question, option: textOption, answer: textAnswer, isDisabled } = req.body;
  //     let parsedQuestion, parsedOption, parsedAnswer;
  //     try {
  //       parsedQuestion = JSON.parse(question);
  //       parsedOption = textOption ? JSON.parse(textOption) : null;
  //       parsedAnswer = textAnswer || null;
  //     } catch (error) {
  //       return res.status(400).send({ message: "Invalid JSON format for type, question, option, or answer!" });
  //     }
  //     const { image, option: uploadedOption, answer: uploadedAnswer } = await uploadMultipleFiles(
  //       req.files,
  //       parsedOption,
  //       parsedAnswer
  //     );

  //     const finalOption =
  //       (uploadedOption && uploadedOption.length > 0) ? uploadedOption :
  //         (parsedOption && parsedOption.length > 0) ? parsedOption :
  //           oldData.option;

  //     const finalAnswer = uploadedAnswer ?? parsedAnswer ?? oldData.answer;
  //     const finalImage = image ?? oldData.image;

  //     const updateData = {
  //       levelId,
  //       lessonId,
  //       question: parsedQuestion,
  //       option: finalOption,
  //       answer: finalAnswer,
  //       image: finalImage,
  //       isDisabled,
  //       updatedAt: serverTimestamp(),
  //     };

  //     // Handle isDisabled-only update
  //     if (
  //       typeof isDisabled !== "undefined" &&
  //       !levelId &&
  //       !lessonId &&
  //       !question &&
  //       !textOption &&
  //       !textAnswer &&
  //       (!req.files || Object.keys(req.files).length === 0)
  //     ) {
  //       updateData.isDisabled = isDisabled === "true" || isDisabled === true;
  //     } else {
  //       let parsedQuestion, parsedOption, parsedAnswer;

  //       // Parse question
  //       try {
  //         parsedQuestion = question ? JSON.parse(question) : oldData.question;
  //       } catch (error) {
  //         return res.status(400).send({ message: "Invalid JSON format for question!" });
  //       }

  //       // Parse textOption and textAnswer
  //       try {
  //         parsedOption = textOption
  //           ? typeof textOption === "string" && textOption.startsWith("[")
  //             ? JSON.parse(textOption)
  //             : [textOption] // Treat as single-item array if plain text
  //           : null;
  //         parsedAnswer = textAnswer || null;
  //       } catch (error) {
  //         return res.status(400).send({ message: "Invalid format for option or answer!" });
  //       }

  //       // Process file uploads and text inputs
  //       const { image, option: uploadedOption, answer: uploadedAnswer } = await uploadMultipleFiles(
  //         req.files || {},
  //         parsedOption,
  //         parsedAnswer
  //       );

  //       // Determine final values for option and answer
  //       const finalOption =
  //         parsedOption && parsedOption.length > 0
  //           ? parsedOption // Prioritize text option if provided
  //           : uploadedOption && uploadedOption.length > 0
  //             ? uploadedOption
  //             : oldData.option;

  //       const finalAnswer =
  //         parsedAnswer !== null
  //           ? parsedAnswer // Prioritize text answer if provided
  //           : uploadedAnswer !== null
  //             ? uploadedAnswer
  //             : oldData.answer;

  //       const finalImage = image !== null ? image : oldData.image;

  //       // Build update data
  //       updateData.levelId = levelId || oldData.levelId;
  //       updateData.lessonId = lessonId || oldData.lessonId;
  //       updateData.question = parsedQuestion;
  //       updateData.option = finalOption;
  //       updateData.answer = finalAnswer;
  //       updateData.image = finalImage;

  //       if (typeof isDisabled !== "undefined") {
  //         updateData.isDisabled = isDisabled === "true" || isDisabled === true;
  //       }
  //     }

  //     await updateDoc(exercisesRef, updateData);
  //     res.status(200).send({ message: "Exercise updated successfully!" });
  //   } catch (error) {
  //     console.error("Error in update:", error.message);
  //     res.status(500).send({ message: error.message });
  //   }
  // };

  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const exerciseRef = doc(db, "exercises", id);
      const docSnapshot = await getDoc(exerciseRef);

      if (!docSnapshot.exists()) {
        return res.status(404).send({ message: "Exercise not found!" });
      }
      const oldData = docSnapshot.data();
      const { levelId, lessonId, question, option: textOption, answer: textAnswer, isDisabled } = req.body;
      const updateData = {
        updatedAt: serverTimestamp(),
      };

      // Handle isDisabled-only update
      if (
        typeof isDisabled !== "undefined" &&
        !levelId &&
        !lessonId &&
        !question &&
        !textOption &&
        !textAnswer &&
        (!req.files || Object.keys(req.files).length === 0)
      ) {
        updateData.isDisabled = isDisabled === "true" || isDisabled === true;
      } else {
        let parsedQuestion, parsedOption, parsedAnswer;

        // Parse question
        try {
          parsedQuestion = question ? JSON.parse(question) : oldData.question;
        } catch (error) {
          return res.status(400).send({ message: "Invalid JSON format for question!" });
        }

        // Parse textOption and textAnswer
        try {
          parsedOption = textOption
            ? typeof textOption === "string" && textOption.startsWith("[")
              ? JSON.parse(textOption)
              : [textOption] // Treat as single-item array if plain text
            : null;
          parsedAnswer = textAnswer || null;
        } catch (error) {
          return res.status(400).send({ message: "Invalid format for option or answer!" });
        }

        // Process file uploads and text inputs
        const { image, option: uploadedOption, answer: uploadedAnswer } = await uploadMultipleFiles(
          req.files || {},
          parsedOption,
          parsedAnswer
        );

        // Determine final values for option and answer
        const finalOption =
          parsedOption && parsedOption.length > 0
            ? parsedOption // Prioritize text option if provided
            : uploadedOption && uploadedOption.length > 0
              ? uploadedOption
              : oldData.option;

        const finalAnswer =
          parsedAnswer !== null
            ? parsedAnswer // Prioritize text answer if provided
            : uploadedAnswer !== null
              ? uploadedAnswer
              : oldData.answer;

        const finalImage = image !== null ? image : oldData.image;

        // Build update data
        updateData.levelId = levelId || oldData.levelId;
        updateData.lessonId = lessonId || oldData.lessonId;
        updateData.question = parsedQuestion;
        updateData.option = finalOption;
        updateData.answer = finalAnswer;
        updateData.image = finalImage;

        if (typeof isDisabled !== "undefined") {
          updateData.isDisabled = isDisabled === "true" || isDisabled === true;
        }
      }

      await updateDoc(exerciseRef, updateData);
      res.status(200).send({ message: "Exercise updated successfully!" });
    } catch (error) {
      console.error("Error in update:", error.message);
      res.status(500).send({ message: error.message });
    }
  };

  getByLessonQuery = async (req, res, next) => {
    try {
      const lessonId = req.params.id; // Lấy lessonId từ query parameter
      if (!lessonId) {
        return res.status(400).send({ message: "lessonId is required in query parameters!" });
      }
      const exercisesRef = collection(db, "exercises");
      const q = query(exercisesRef, where("lessonId", "==", lessonId));
      const snapshot = await getDocs(q);
      const exerciseArray = snapshot.docs.map((doc) => Exercise.fromFirestore(doc));
      res.status(200).send(exerciseArray);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };
}

module.exports = new ExerciseController();
