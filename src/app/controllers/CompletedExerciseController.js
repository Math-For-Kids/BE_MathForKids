const CompletedExercises = require("../models/CompletedExercise");
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
} = require("firebase/firestore");
const db = getFirestore();

class CompletedExerciseController {
  // Create completed exercise
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "completed_exercises"), {
        ...data,
        createAt: serverTimestamp(),
      });
      res.status(201).send({
        message: {
          en: "Completed exercise created successfully",
          vi: "Lưu bài tập đã hoàn thành thành công!",
        },
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

  // Get all completed exercises
  getAll = async (req, res, next) => {
    try {
      const completedExercises = await getDocs(
        collection(db, "completed_exercises")
      );
      const completedExerciseData = completedExercises.docs.map((doc) =>
        CompletedExercises.fromFirestore(doc)
      );
      res.status(200).send(completedExerciseData);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get completed exercise by ID
  getById = async (req, res, next) => {
    const id = req.params.id;
    const completedExercise = req.completedExercise;
    res.status(200).send({ id: id, ...completedExercise });
  };

  // Get completed exercises by pupil ID
  getCompletedExerciseByPupilId = async (req, res, next) => {
    try {
      const pupilId = req.params.id;
      console.log("Querying for pupilId:", pupilId); // Debug log
      const q = query(
        collection(db, "completed_exercises"),
        where("pupilId", "==", pupilId),
        orderBy("createdAt", "desc")
      );
      const completedExerciseSnapshot = await getDocs(q);
      const completedExerciseArray = completedExerciseSnapshot.docs.map((doc) =>
        CompletedExercises.fromFirestore(doc)
      );
      res.status(200).send(completedExerciseArray);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get completed exercises by lesson ID
  getCompletedExercisesByLesson = async (req, res, next) => {
    try {
      const lessonId = req.params.lessonId;
      console.log("Querying for lessonId:", lessonId); // Debug log
      const q = query(
        collection(db, "completed_exercises"),
        where("lessonId", "==", lessonId)
      );
      const completedExerciseSnapshot = await getDocs(q);

      const allCompletedExercises = completedExerciseSnapshot.docs.map((doc) =>
        CompletedExercises.fromFirestore(doc)
      );
      // Lấy completedExercise mới nhất theo pupilId
      const latestCompletedExercisesByPupil = {};

      for (const completedExercise of allCompletedExercises) {
        const pupilId = completedExercise.pupilId;
        const current = latestCompletedExercisesByPupil[pupilId];

        // Nếu chưa có hoặc completedExercise mới hơn => cập nhật
        if (
          !current ||
          new Date(completedExercise.createdAt) > new Date(current.createdAt)
        ) {
          latestCompletedExercisesByPupil[pupilId] = completedExercise;
        }
      }

      // Trả về mảng kết quả
      const result = Object.values(latestCompletedExercisesByPupil);
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get completed exercise by pupil ID & lesson ID
  getCompletedExercisesByPupilIdAndLesson = async (req, res, next) => {
    try {
      const { pupilId, lessonId } = req.params;
      console.log("Querying for lessonId:", pupilId, "and lessonId", lessonId); // Debug log
      const q = query(
        collection(db, "completed_exercises"),
        where("pupilId", "==", pupilId),
        where("lessonId", "==", lessonId)
      );
      const completedExerciseSnapshot = await getDocs(q);
      const completedExerciseArray = completedExerciseSnapshot.docs.map((doc) =>
        CompletedExercises.fromFirestore(doc)
      );
      res.status(200).send(completedExerciseArray);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };
}

module.exports = new CompletedExerciseController();
