const Lesson = require("../models/Lesson");
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

const db = getFirestore();

class LessonController {
  // Create lesson
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "lessons"), {
        ...data,
        isDisabled: false,
        createdAt: serverTimestamp(),
      });
      res.status(201).send({
        message: {
          en: "Lesson created successfully!",
          vi: "Tạo bài học thành công!",
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

  // Count all lessons by grade & type
  countAll = async (req, res, next) => {
    try {
      const data = req.body;
      const q = query(
        collection(db, "lessons"),
        where("grade", "==", data.grade),
        where("type", "==", data.type)
      );
      const snapshot = await getCountFromServer(q);
      res.status(200).send(snapshot.data().count);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get all paginated lessons by grade & type
  getAll = async (req, res, next) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10; // số bài học mỗi trang
      const startAfterId = req.query.startAfterId || null; // ID của document bắt đầu sau đó
      const data = req.body;
      let q;

      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "lessons", startAfterId));
        q = query(
          collection(db, "lessons"),
          where("grade", "==", data.grade),
          where("type", "==", data.type),
          orderBy("order"),
          startAfter(startDoc),
          limit(pageSize)
        );
      } else {
        const q = query(
          collection(db, "lessons"),
          where("grade", "==", data.grade),
          where("type", "==", data.type),
          orderBy("order"),
          limit(pageSize)
        );
      }
      const snapshot = await getDocs(q);
      const lessons = snapshot.docs.map((doc) => Lesson.fromFirestore(doc));

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: lessons,
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

  // Count lessons by grade, type & disabled state
  countByDisabledStatus = async (req, res, next) => {
    try {
      const data = req.body;
      const q = query(
        collection(db, "lessons"),
        where("grade", "==", data.grade),
        where("type", "==", data.type),
        where("isDisabled", "==", data.isDisabled)
      );
      const snapshot = await getCountFromServer(q);
      res.status(200).send(snapshot.data().count);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Filter paginated lessons by grade, type & disabled state
  filterByDisabledStatus = async (req, res, next) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10; // số bài học mỗi trang
      const startAfterId = req.query.startAfterId || null; // ID của document bắt đầu sau đó
      const data = req.body;
      let q;

      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "lessons", startAfterId));
        q = query(
          collection(db, "lessons"),
          where("grade", "==", data.grade),
          where("type", "==", data.type),
          where("isDisabled", "==", data.isDisabled),
          orderBy("order"),
          startAfter(startDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "lessons"),
          where("grade", "==", data.grade),
          where("type", "==", data.type),
          where("isDisabled", "==", data.isDisabled),
          orderBy("order"),
          limit(pageSize)
        );
      }
      const snapshot = await getDocs(q);
      const lessons = snapshot.docs.map((doc) => Lesson.fromFirestore(doc));

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: lessons,
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

  // Get enable lesson by grade & type
  // getByGradeAndType = async (req, res, next) => {
  //   try {
  //     const data = req.body;
  //     const q = query(
  //       collection(db, "lessons"),
  //       where("grade", "==", data.grade),
  //       where("type", "==", data.type),
  //       where("isDisabled", "==", false)
  //     );
  //     const lessons = await getDocs(q);
  //     const lessonArray = lessons.docs.map((doc) => Lesson.fromFirestore(doc));
  //     res.status(200).send(lessonArray);
  //   } catch (error) {
  //     res.status(500).send({
  //       message: {
  //         en: error.message,
  //         vi: "Đã xảy ra lỗi nội bộ.",
  //       },
  //     });
  //   }
  // };
  // Get enable lessons by grade & type (via query params)
  getByGradeAndType = async (req, res, next) => {
    try {
      const { grade, type } = req.query;

      const q = query(
        collection(db, "lessons"),
        where("grade", "==", Number(grade)), // ép kiểu vì query param là string
        where("type", "==", type),
        where("isDisabled", "==", false)
      );

      const lessons = await getDocs(q);
      const lessonArray = lessons.docs.map((doc) => Lesson.fromFirestore(doc));
      res.status(200).send(lessonArray);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get a lesson by ID
  getById = async (req, res, next) => {
    const id = req.params.id;
    const lesson = req.lesson;
    res.status(200).send({ id: id, ...lesson });
  };

  // Update lesson
  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { createdAt, ...data } = req.body;
      const lesson = doc(db, "lessons", id);
      await updateDoc(lesson, { ...data, updatedAt: serverTimestamp() });
      res.status(200).send({ message: "Lesson updated successfully!" });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Count all enable lessons
  countLessons = async (req, res, next) => {
    try {
      const q = query(
        collection(db, "lessons"),
        where("isDisabled", "==", false)
      );
      const snapshot = await getDocs(q);
      const count = snapshot.size;
      res.status(200).send({ count: count });
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

module.exports = new LessonController();
