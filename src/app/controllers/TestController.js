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

  // Get tests by pupil ID
  getTestByPupilId = async (req, res, next) => {
    try {
      const pupilId = req.params.id;
      console.log("Querying for pupilId:", pupilId); // Debug log
      const q = query(
        collection(db, "tests"),
        where("pupilId", "==", pupilId),
        orderBy("createdAt", "desc")
      );
      const testSnapshot = await getDocs(q);
      const testArray = testSnapshot.docs.map((doc) =>
        Tests.fromFirestore(doc)
      );
      res.status(200).send(testArray);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get tests by lesson ID
  getTestsByLesson = async (req, res, next) => {
    try {
      const lessonId = req.params.lessonId;
      console.log("Querying for lessonId:", lessonId); // Debug log
      const q = query(
        collection(db, "tests"),
        where("lessonId", "==", lessonId)
      );
      const testSnapshot = await getDocs(q);

      const allTests = testSnapshot.docs.map((doc) => Tests.fromFirestore(doc));
      // Lấy test mới nhất theo pupilId
      const latestTestsByPupil = {};

      for (const test of allTests) {
        const pupilId = test.pupilId;
        const current = latestTestsByPupil[pupilId];

        // Nếu chưa có hoặc test mới hơn => cập nhật
        if (
          !current ||
          new Date(test.createdAt) > new Date(current.createdAt)
        ) {
          latestTestsByPupil[pupilId] = test;
        }
      }

      // Trả về mảng kết quả
      const result = Object.values(latestTestsByPupil);
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

  // Get test by pupil ID & lesson ID
  getTestsByPupilIdAndLesson = async (req, res, next) => {
    try {
      const { pupilId, lessonId } = req.params;
      console.log("Querying for lessonId:", pupilId, "and lessonId", lessonId); // Debug log
      const q = query(
        collection(db, "tests"),
        where("pupilId", "==", pupilId),
        where("lessonId", "==", lessonId)
      );
      const testSnapshot = await getDocs(q);
      const testArray = testSnapshot.docs.map((doc) =>
        Tests.fromFirestore(doc)
      );
      res.status(200).send(testArray);
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
