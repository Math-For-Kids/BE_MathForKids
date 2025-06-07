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

  // Get all tests
  getAll = async (req, res, next) => {
    try {
      const tests = await getDocs(collection(db, "tests"));
      const testData = tests.docs.map((doc) => Tests.fromFirestore(doc));
      res.status(200).send(testData);
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


  // Get tests pasge
  getAllpasge = async (req, res) => {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfterId || null;

      let q;
      if (startAfterId) {
        const startDoc = await getDoc(doc(db, "tests", startAfterId));
        q = query(
          collection(db, "tests"),
          startAfter(startDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "tests"),
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
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "tests"),
          where("pupilId", "==", pupilID),
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
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "tests"),
          where("lessonId", "==", lessonID),
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

  //Filter by point
  filterByPoint = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const startAfterId = req.query.startAfterId || null;
    const point = parseFloat(req.params.point); // vì point là số

    if (isNaN(point)) {
      return res.status(400).send({
        message: {
          en: "Invalid point value.",
          vi: "Giá trị điểm không hợp lệ.",
        },
      });
    }

    let q;
    if (startAfterId) {
      const startDoc = await getDoc(doc(db, "tests", startAfterId));
      q = query(
        collection(db, "tests"),
        where("point", "==", point),
        startAfter(startDoc),
        limit(pageSize)
      );
    } else {
      q = query(
        collection(db, "tests"),
        where("point", "==", point),
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
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, "tests"),
          where("pupilId", "==", pupilID),
          where("lessonId", "==", lessonID),
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

  //Filter by lessonID & point
  filterByLessonIDAndPoint = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const startAfterId = req.query.startAfterId || null;
    const { lessonID, point } = req.params;

    if (!lessonID) {
      return res.status(400).send({
        message: {
          en: "Missing lessonID in URL parameters.",
          vi: "Thiếu lessonID trong đường dẫn.",
        },
      });
    }

    const pointNumber = parseFloat(point);
    if (isNaN(pointNumber)) {
      return res.status(400).send({
        message: {
          en: "Invalid point value.",
          vi: "Giá trị điểm không hợp lệ.",
        },
      });
    }

    let q;
    if (startAfterId) {
      const startDoc = await getDoc(doc(db, "tests", startAfterId));
      q = query(
        collection(db, "tests"),
        where("lessonId", "==", lessonID),
        where("point", "==", pointNumber),
        startAfter(startDoc),
        limit(pageSize)
      );
    } else {
      q = query(
        collection(db, "tests"),
        where("lessonId", "==", lessonID),
        where("point", "==", pointNumber),
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
