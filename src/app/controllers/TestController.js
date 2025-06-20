const Tests = require("../models/Test");
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
  getCountFromServer,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} = require("firebase/firestore");
const db = getFirestore();

class TestController {
  // Create test
  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "tests"), {
        ...data,
        createAt: serverTimestamp(),
      });
      res.status(201).send({
        message: {
          en: "Test created successfully",
          vi: "Tạo bài kiểm tra thành công!",
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

  // Get test by ID
  getById = async (req, res, next) => {
    const id = req.params.id;
    const test = req.test;
    res.status(200).send({ id: id, ...test });
  };

  // Count all test
  countAll = async (req, res, next) => {
    try {
      const q = query(
        collection(db, "tests"),
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

  // Get all paginated tests
  getAll = async (req, res, next) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      let q;
      if (startAfterId) {
        const startDocRef = doc(db, "tests", startAfterId);
        const startDocSnap = await getDoc(startDocRef);
        if (!startDocSnap.exists()) {
          return res.status(400).send({
            message: {
              en: "Invalid startAfterId",
              vi: "startAfterId không hợp lệ",
            },
          });
        }
        q = query(
          collection(db, "tests"),
          orderBy("createdAt", "desc"),
          startAfter(startDocSnap),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "tests"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const pupilArray = snapshot.docs.map((doc) => Tests.fromFirestore(doc));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: pupilArray,
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

  // Count tests by pupil ID
  countTestsByPupilID = async (req, res, next) => {
    try {
      const { pupilId } = req.params;
      const q = query(
        collection(db, "tests"),
        where("pupilId", "==", pupilId),
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

  //Filter paginated tests by pupilID
  filterByPupilID = async (req, res) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { pupilID } = req.params;

      let q;
      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "tests", startAfterId));
        q = query(
          collection(db, "tests"),
          where("pupilId", "==", pupilID),
          startAfter(startDoc),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "tests"),
          where("pupilId", "==", pupilID),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const tests = snapshot.docs.map((doc) => Tests.fromFirestore(doc));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: tests,
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

  // Count tests by lesson ID
  countTestsByLessonID = async (req, res, next) => {
    try {
      const { lessonId } = req.params;
      const q = query(
        collection(db, "tests"),
        where("lessonId", "==", lessonId),
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

  //Filter by lessonID
  filterByLessonID = async (req, res) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { lessonID } = req.params;

      let q;
      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "tests", startAfterId));
        q = query(
          collection(db, "tests"),
          where("lessonId", "==", lessonID),
          startAfter(startDoc),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "tests"),
          where("lessonId", "==", lessonID),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const tests = snapshot.docs.map((doc) => Tests.fromFirestore(doc));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: tests,
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


  // Count tests by point
  countTestsByPoint = async (req, res, next) => {
    try {
      const { condition, point } = req.query;
      const q = query(
        collection(db, "tests"),
        where("point", condition, parseInt(point)),
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

  //Filter by point
  filterByPoint = async (req, res) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { condition, point } = req.query;

      let q;
      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "tests", startAfterId));
        q = query(
          collection(db, "tests"),
          where("point", condition, parseInt(point)),
          startAfter(startDoc),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "tests"),
          where("point", condition, parseInt(point)),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const tests = snapshot.docs.map((doc) => Tests.fromFirestore(doc));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: tests,
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

  // Count tests by pupilID & lessonID
  countTestsByPupilIdAndLessonId = async (req, res, next) => {
    try {
      const { lessonID, pupilID } = req.params;
      const q = query(
        collection(db, "tests"),
        where("lessonID", "==", lessonID),
        where("pupilID", "==", pupilID),
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

  // Filter by pupilID & lessonID
  filterByPupilAndLesson = async (req, res) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { pupilID, lessonID } = req.params;

      let q;
      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "tests", startAfterId));
        q = query(
          collection(db, "tests"),
          where("pupilId", "==", pupilID),
          where("lessonId", "==", lessonID),
          startAfter(startDoc),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "tests"),
          where("pupilId", "==", pupilID),
          where("lessonId", "==", lessonID),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const tests = snapshot.docs.map((doc) => Tests.fromFirestore(doc));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: tests,
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
  //Count tests by lessonID & point
  countTestsByLessonIdAndPoint = async (req, res, next) => {
    try {
      const { lessonID } = req.params;
      const { condition, point } = req.query;

      const parsedPoint = parseInt(point);

      const q = query(
        collection(db, "tests"),
        where("lessonID", "==", lessonID),
        where("point", condition, parsedPoint),
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


  //Filter by lessonID & point
  filterByLessonIDAndPoint = async (req, res) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;
      const { lessonID } = req.params;
      const { condition, point } = req.query;
      let q;
      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "tests", startAfterId));
        q = query(
          collection(db, "tests"),
          where("lessonId", "==", lessonID),
          where("point", condition, parseInt(point)),
          startAfter(startDoc),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "tests"),
          where("lessonId", "==", lessonID),
          where("point", condition, parseInt(point)),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const tests = snapshot.docs.map((doc) => Tests.fromFirestore(doc));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      res.status(200).send({
        data: tests,
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
}

module.exports = new TestController();
