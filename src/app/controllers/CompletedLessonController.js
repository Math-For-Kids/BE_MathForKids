const CompletedLesson = require("../models/CompletedLesson");
const {
  getFirestore,
  collection,
  doc,
  getDoc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} = require("firebase/firestore");
const db = getFirestore();

class CompletedLessonController {
  // Create completed lesson
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "completed_lessons"), {
        ...data,
        isCompleted: false,
        isBlock: data.isBlock ?? false,
        createAt: serverTimestamp(),
      });
      res
        .status(201)
        .send({ message: {
          en: "Completed lesson created successfully!",
          vi: "Tạo thông tin lưu trạng thái bài học thành công!",
        } });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get completed lesson by pupil ID & lesson
  getByPupilLesson = async (req, res, next) => {
    try {
      const { pupilId, lessonId } = req.params;
      console.log("Querying for lessonId:", pupilId, "and lessonId", lessonId); // Debug log
      const q = query(
        collection(db, "completed_lessons"),
        where("pupilId", "==", pupilId),
        where("lessonId", "==", lessonId)
      );
      const completedlessonSnapshot = await getDocs(q);
      const completedlessonArray = completedlessonSnapshot.docs.map((doc) =>
        CompletedLesson.fromFirestore(doc)
      );
      res.status(200).send(completedlessonArray);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get completed lessons by pupil ID
  getByPupil = async (req, res, next) => {
    try {
      const pupilId = req.params.pupilId;
      console.log("Querying for pupilId:", pupilId); // Debug log
      const q = query(
        collection(db, "completed_lessons"),
        where("PupilId", "==", pupilId)
      );
      const completedlessonSnapshot = await getDocs(q);
      const completedlessonArray = completedlessonSnapshot.docs.map((doc) =>
        CompletedLesson.fromFirestore(doc)
      );
      res.status(200).send(completedlessonArray);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Update completed lesson status
  updateStatus = async (req, res, next) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const completed_lessons = doc(db, "completed_lessons", id);
            await updateDoc(completed_lessons, { ...data, updateAt: serverTimestamp() });
            res.status(200).send({ message: {
          en: "Completed lesson updated successfully!",
          vi: "Cập nhật trạng thái bài học thành công!",
        } });
        } catch (error) {
            res.status(500).send({ message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        } });
        }
    };
}
module.exports = new CompletedLessonController();
