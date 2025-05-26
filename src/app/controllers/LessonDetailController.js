const LessonDetail = require("../models/LessonDetail");
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

class LessonDetailController {
  // Tạo lesson detail mới
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "lesson_details"), {
        ...data,
        isDisabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Lesson detail created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  // Lấy tất cả lesson details
//   getAll = async (req, res, next) => {
//     try {
//       const snapshot = await getDocs(collection(db, "lesson_details"));
//       const list = snapshot.docs.map((doc) => LessonDetail.fromFirestore(doc));
//       res.status(200).send(list);
//     } catch (error) {
//       res.status(400).send({ message: error.message });
//     }
//   };

  // Lấy theo lessonId
  getByLessonId = async (req, res, next) => {
    try {
      const lessonId = req.params.lessonId;
      const q = query(
        collection(db, "lesson_details"),
        where("lessonId", "==", lessonId)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => LessonDetail.fromFirestore(doc));
      res.status(200).send(list);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  // Lấy chi tiết theo ID
  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const docRef = doc(db, "lesson_details", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        res.status(200).send(LessonDetail.fromFirestore(docSnap));
      } else {
        res.status(404).send({ message: "Lesson detail not found!" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  // Cập nhật lesson detail
  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { createdAt, ...data } = req.body;
      const docRef = doc(db, "lesson_details", id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Lesson detail updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  // Vô hiệu hoá lesson detail
  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      const docRef = doc(db, "lesson_details", id);
      await updateDoc(docRef, {
        isDisabled: true,
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Lesson detail disabled successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  // Đếm số lượng lesson detail theo lessonId
  countByLessonId = async (req, res, next) => {
    try {
      const lessonId = req.params.lessonId;
      const q = query(
        collection(db, "lesson_details"),
        where("lessonId", "==", lessonId)
      );
      const snapshot = await getDocs(q);
      res.status(200).send({ count: snapshot.size });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new LessonDetailController();
