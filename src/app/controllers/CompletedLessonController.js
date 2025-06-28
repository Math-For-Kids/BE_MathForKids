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
  orderBy,
  limit,
  startAfter,
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
        .send({
          message: {
            en: "Completed lesson created successfully!",
            vi: "Tạo thông tin lưu trạng thái bài học thành công!",
          }
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

  getAll = async (req, res, next) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { grade, type, pupilId } = req.query;

      if (!pupilId || !grade || !type) {
        return res.status(400).send({
          message: {
            en: "pupilId, grade, and type are required!",
            vi: "Yêu cầu cung cấp pupilId, grade và type!",
          },
        });
      }

      // Step 1: Get all completed lessons by pupilId
      const completedQuery = query(
        collection(db, "completed_lessons"),
        where("pupilId", "==", pupilId)
      );
      const completedSnapshot = await getDocs(completedQuery);
      console.log("✅ Completed lessons found:", completedSnapshot.size);

      const completedLessons = completedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (completedLessons.length === 0) {
        return res.status(200).send({
          data: [],
          nextPageToken: null,
        });
      }

      // Step 2: Get lessonIds from completed lessons
      const completedLessonIds = completedLessons.map((cl) => cl.lessonId);

      // Step 3: Fetch lesson documents by ID using getDoc (Firestore does not support where(documentId(), "in", [...]) > 10)
      const lessonSnapshots = await Promise.all(
        completedLessonIds.map((id) => getDoc(doc(db, "lessons", id)))
      );

      const lessons = lessonSnapshots
        .filter((snap) => snap.exists())
        .map((snap) => ({
          id: snap.id,
          ...snap.data(),
        }))
        .filter(
          (lesson) =>
            lesson.grade === parseInt(grade) &&
            lesson.type === type &&
            lesson.isDisabled === false
        );

      // Step 4: Optional - sort by 'order'
      lessons.sort((a, b) => a.order - b.order);

      // Step 5: Apply pagination manually
      let pagedLessons = lessons;
      if (startAfterId) {
        const startIndex = lessons.findIndex((l) => l.id === startAfterId);
        if (startIndex >= 0) {
          pagedLessons = lessons.slice(startIndex + 1, startIndex + 1 + pageSize);
        } else {
          pagedLessons = lessons.slice(0, pageSize);
        }
      } else {
        pagedLessons = lessons.slice(0, pageSize);
      }

      const nextPageToken =
        pagedLessons.length === pageSize
          ? pagedLessons[pagedLessons.length - 1].id
          : null;

      // Step 6: Merge with completionStatus
      const completedMap = {};
      completedLessons.forEach((cl) => (completedMap[cl.lessonId] = cl));

      const result = pagedLessons.map((lesson) => {
        const completed = completedMap[lesson.id];
        return {
          ...lesson,
          completedLessonId: completed ? completed.id : null, // Add completed_lesson ID
          isBlock: completed ? completed.isBlock : true,
          isCompleted: completed ? completed.isCompleted : false,
        };
      });

      return res.status(200).send({
        data: result,
        nextPageToken,
      });
    } catch (error) {
      console.error("Error in getAll:", error);
      return res.status(500).send({
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
        where("pupilId", "==", pupilId)
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
      res.status(200).send({
        message: {
          en: "Completed lesson updated successfully!",
          vi: "Cập nhật trạng thái bài học thành công!",
        }
      });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        }
      });
    }
  };
}
module.exports = new CompletedLessonController();
