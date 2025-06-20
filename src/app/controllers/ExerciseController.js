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
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
} = require("firebase/firestore");
const { uploadMultipleFiles } = require("./fileController");

const db = getFirestore();

class ExerciseController {
  // Create exercise
  create = async (req, res, next) => {
    try {
      const {
        levelId,
        lessonId,
        question,
        option: textOption,
        answer: textAnswer,
      } = req.body;
      const parsedQuestion = JSON.parse(question);
      const { image, option, answer } = await uploadMultipleFiles(
        req.files,
        textOption,
        textAnswer
      );
      const exercisesRef = await addDoc(collection(db, "exercises"), {
        levelId,
        lessonId,
        question: parsedQuestion,
        option, // Array of text or image URLs
        answer,
        image,
        isDisabled: false,
        createdAt: serverTimestamp(),
      });

      res.status(201).send({
        message: {
          en: "Exercises created successfully!",
          vi: "Tạo mới bài tập thành công!",
        },
        data: exercisesRef.id,
      });
    } catch (error) {
      console.error("Error in create:", error.message);
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Count all exercises by lesson ID
  countByLesson = async (req, res, next) => {
    try {
      const { lessonId } = req.params;
      const q = query(
        collection(db, "exercises"),
        where("lessonId", "==", lessonId)
      );
      const snapshot = await getCountFromServer(q);
      res.status(200).send({ count: snapshot.data().count });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };
  countByLessonAndDisabledStatus = async (req, res, next) => {
    try {
      const { lessonId } = req.params;
      const { isDisabled } = req.query;
      const q = query(
        collection(db, "exercises"),
        where("lessonId", "==", lessonId),
        where("isDisabled", "==", isDisabled === "true")
      );
      const snapshot = await getCountFromServer(q);
      res.status(200).send({ count: snapshot.data().count });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };
  countByLessonAndLevelAndDisabledStatus = async (req, res, next) => {
    try {
      const { lessonId, levelId } = req.params;
      const { isDisabled } = req.query;
      const q = query(
        collection(db, "exercises"),
        where("lessonId", "==", lessonId),
        where("levelId", "==", levelId),
        where("isDisabled", "==", isDisabled === "true")
      );
      const snapshot = await getCountFromServer(q);
      res.status(200).send({ count: snapshot.data().count });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };
  // Get all paginated exercises by lesson ID
  getByLesson = async (req, res, next) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { lessonId } = req.params;
      let q;
      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "exercises", startAfterId));
        q = query(
          collection(db, "exercises"),
          where("lessonId", "==", lessonId),
          orderBy("createdAt", "desc"),
          startAfter(startDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "exercises"),
          where("lessonId", "==", lessonId),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }
      const snapshot = await getDocs(q);
      const exercises = snapshot.docs.map((doc) => Exercise.fromFirestore(doc));

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: exercises,
        nextPageToken: lastVisibleId, // Dùng làm startAfterId cho trang kế
      });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Filter exercises by isDisabled
  filterByIsDisabled = async (req, res, next) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { lessonId } = req.params;
      const { isDisabled } = req.query;

      let q;
      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "exercises", startAfterId));
        q = query(
          collection(db, "exercises"),
          where("lessonId", "==", lessonId),
          where("isDisabled", "==", isDisabled === "true"),
          orderBy("createdAt", "desc"),
          startAfter(startDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "exercises"),
          where("lessonId", "==", lessonId),
          where("isDisabled", "==", isDisabled === "true"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }
      const snapshot = await getDocs(q);
      const exercises = snapshot.docs.map((doc) => Exercise.fromFirestore(doc));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: exercises,
        nextPageToken: lastVisibleId, // Dùng làm startAfterId cho trang kế
      });
    } catch (error) {
      console.error("Error in filterByIsDisabled:", error.message);
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Filter exercises by isDisabled and level
  filterByLevelAndIsDisabled = async (req, res, next) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { lessonId, levelId } = req.params;
      const { isDisabled } = req.query;

      let q;
      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "exercises", startAfterId));
        q = query(
          collection(db, "exercises"),
          where("lessonId", "==", lessonId),
          where("levelId", "==", levelId),
          where("isDisabled", "==", isDisabled === "true"),
          orderBy("createdAt", "desc"),
          startAfter(startDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "exercises"),
          where("lessonId", "==", lessonId),
          where("levelId", "==", levelId),
          where("isDisabled", "==", isDisabled === "true"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }
      const snapshot = await getDocs(q);
      const exercises = snapshot.docs.map((doc) => Exercise.fromFirestore(doc));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: exercises,
        nextPageToken: lastVisibleId, // Dùng làm startAfterId cho trang kế
      });
    } catch (error) {
      console.error("Error in filterByIsDisabled:", error.message);
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Count all exercises by lesson ID & level ID
  countByLessonAndLevel = async (req, res, next) => {
    try {
      const { lessonId, levelId } = req.params;
      const q = query(
        collection(db, "exercises"),
        where("lessonId", "==", lessonId),
        where("levelId", "==", levelId)
      );
      const snapshot = await getCountFromServer(q);
      res.status(200).send({ count: snapshot.data().count });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Filter all paginated exercises by lesson ID & level ID
  filterByLessonAndLevel = async (req, res, next) => {
    try {
      const pageSize = parseInt(req.params.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { lessonId, levelId } = req.params;
      let q;
      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "exercises", startAfterId));
        q = query(
          collection(db, "exercises"),
          where("lessonId", "==", lessonId),
          where("levelId", "==", levelId),
          orderBy("createdAt", "desc"),
          startAfter(startDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "exercises"),
          where("lessonId", "==", lessonId),
          where("levelId", "==", levelId),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }
      const snapshot = await getDocs(q);
      const exercises = snapshot.docs.map((doc) => Exercise.fromFirestore(doc));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: exercises,
        nextPageToken: lastVisibleId,
      });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get enable exercises by lessonId
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
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get an exercise by type and grade
  getByGradeAndType = async (req, res, next) => {
    try {
      const { grade, type } = req.query;

      const q = query(
        collection(db, "exercises"),
        where("grade", "==", Number(grade)),
        where("type", "==", type),
        where("isDisabled", "==", false)
      );

      const snapshot = await getDocs(q);
      const exerciseArray = snapshot.docs.map((doc) =>
        Exercise.fromFirestore(doc)
      );

      res.status(200).send(exerciseArray);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get an exercise by ID
  getById = async (req, res, next) => {
    const id = req.params.id;
    const exercise = req.exercise;
    res.status(200).send({ id: id, ...exercise });
  };
  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const exerciseRef = doc(db, "exercises", id);
      const oldData = req.exercise;
      const {
        levelId,
        lessonId,
        question,
        option: textOption,
        answer: textAnswer,
        isDisabled,
      } = req.body;
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
          return res
            .status(400)
            .send({ message: "Invalid JSON format for question!" });
        }

        // Parse textOption and textAnswer
        try {
          parsedOption = textOption
            ? typeof textOption === "string" && textOption.startsWith("[")
              ? JSON.parse(textOption)
              : Array.isArray(textOption)
                ? textOption
                : [textOption]
            : null;
          parsedAnswer = textAnswer || null;
        } catch (error) {
          return res
            .status(400)
            .send({ message: "Invalid format for option or answer!" });
        }

        // Process file uploads
        const {
          image,
          option: uploadedOption,
          answer: uploadedAnswer,
        } = await uploadMultipleFiles(
          req.files || {},
          parsedOption,
          parsedAnswer
        );

        // Determine if dealing with image or text options
        const isImageOption =
          (req.files && (req.files.option || req.files.answer)) ||
          (parsedOption &&
            Array.isArray(parsedOption) &&
            parsedOption.some(opt => typeof opt === "string" && opt.startsWith("http")));

        // Handle options
        let finalOption;
        if (isImageOption) {
          if (uploadedOption && uploadedOption.length > 0) {
            finalOption = uploadedOption.filter(opt => opt !== null && opt !== "");
          } else if (
            parsedOption &&
            Array.isArray(parsedOption) &&
            parsedOption.some(opt => typeof opt === "string" && opt.startsWith("http"))
          ) {
            finalOption = parsedOption.filter(opt => typeof opt === "string" && opt !== "");
          } else {
            finalOption = oldData.option || [];
          }
        } else {
          finalOption =
            parsedOption && Array.isArray(parsedOption) && parsedOption.length > 0
              ? parsedOption.filter(opt => typeof opt === "string" && opt !== "")
              : oldData.option || [];
        }

        // Handle answer
        const finalAnswer = isImageOption
          ? uploadedAnswer !== null
            ? uploadedAnswer
            : parsedAnswer && typeof parsedAnswer === "string" && parsedAnswer.startsWith("http")
              ? parsedAnswer
              : oldData.answer
          : parsedAnswer !== null
            ? parsedAnswer
            : oldData.answer;

        // Handle image
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
      res.status(200).send({
        message: {
          en: "Exercise updated successfully!",
          vi: "Cập nhật bài tập thành công!",
        },
      });
    } catch (error) {
      console.error("Error in update:", error.message);
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
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
}

module.exports = new ExerciseController();
