const TestQuestion = require("../models/TestQuestions");
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

class TestQuestionController {
  // Create multiple test questions
  createMultiple = async (req, res) => {
    try {
      const data = req.body;
      // Dùng Promise.all để tạo song song
      await Promise.all(
        data.map((item) =>
          addDoc(collection(db, "test_questions"), {
            ...item,
            createdAt: serverTimestamp(),
          })
        )
      );
      res.status(201).send({
        message: {
          en: "Test questions created successfully!",
          vi: "Tạo các câu hỏi cho bài kiểm thành công",
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

  // Get test question by ID
  getById = async (req, res) => {
    const id = req.params.id;
    const testQuestion = req.testQuestion;
    res.status(200).send({ id: id, ...testQuestion });
  };

  // Get test questions by test ID
  getByTest = async (req, res, next) => {
    try {
      const testId = req.params.testId;
      console.log("Querying for TestId:", testId); // Debug log
      const q = query(
        collection(db, "test_questions"),
        where("testId", "==", testId),
        orderBy("createdAt", "desc")
      );
      const testQuestionSnapshot = await getDocs(q);
      const testQuestionArray = testQuestionSnapshot.docs.map((doc) =>
        TestQuestion.fromFirestore(doc)
      );
      res.status(200).send(testQuestionArray);
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

module.exports = new TestQuestionController();
