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
  Timestamp,
} = require("firebase/firestore");
const db = getFirestore();

class TestController {
  // Create test
  create = async (req, res, next) => {
    try {
      const data = req.body;
      const docRef = await addDoc(collection(db, "tests"), {
        ...data,
        createdAt: serverTimestamp(),
      });

      res.status(201).send({
        message: {
          id: docRef.id, // <-- đúng nè, ID thực tế của document mới tạo
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
      const q = query(collection(db, "tests"));
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
  countCompletedTestPupil = async (req, res, next) => {
    try {
      const pupilId = req.params.pupilId;
      const grade = req.query.grade;
      console.log("Querying for pupilId:", pupilId); // Debug log
      const lessonQuery = query(
        collection(db, "lessons"),
        where("grade", "==", parseInt(grade))
      );
      const lessonSnapshot = await getDocs(lessonQuery);
      const lessonIds = lessonSnapshot.docs.map((doc) => doc.id);
      if (lessonIds.length === 0) {
        return res.status(200).send({
          totalLessons: 0,
          completedLessons: 0,
          completedTest: 0,
        });
      }
      const chunkArray = (array, size) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
          chunks.push(array.slice(i, i + size));
        }
        return chunks;
      };
      const lessonIdChunks = chunkArray(lessonIds, 30);
      let totalLessons = lessonIds.length;
      let completedLessons = 0;
      let uniqueTest = new Set();
      for (const chunk of lessonIdChunks) {
        const lessonQuery = query(
          collection(db, "completed_lessons"),
          where("pupilId", "==", pupilId),
          where("lessonId", "in", chunk),
          where("isBlock", "==", false),
          where("isCompleted", "==", true)
        );
        const LessonSnapshot = await getCountFromServer(lessonQuery);
        completedLessons += LessonSnapshot.data().count;

        const testQuery = query(
          collection(db, "tests"),
          where("pupilId", "==", pupilId),
          where("lessonId", "in", chunk)
        );
        const TestSnapshot = await getDocs(testQuery);
        TestSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.lessonId) {
            uniqueTest.add(data.lessonId);
          }
        });
      }
      res.status(200).send({
        totalLessons,
        completedLessons,
        completedTest: uniqueTest.size,
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
      const q = query(collection(db, "tests"), where("pupilId", "==", pupilId));
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
        where("point", condition, parseInt(point))
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
        where("pupilID", "==", pupilID)
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
        where("point", condition, parsedPoint)
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
  // Thống kê top 10 học sinh có điểm trung bình cao nhất
  top10PupilsByAveragePoint = async (req, res) => {
    try {
      // Lấy tất cả bài kiểm tra
      const snapshot = await getDocs(collection(db, "tests"));
      const tests = snapshot.docs.map((doc) => Tests.fromFirestore(doc));

      // Tạo object để lưu tổng điểm và số bài kiểm tra của từng học sinh
      const pupilStats = {};

      // Duyệt qua các bài kiểm tra để tính tổng điểm và số bài kiểm tra
      tests.forEach((test) => {
        const { pupilId, point } = test;
        if (!pupilStats[pupilId]) {
          pupilStats[pupilId] = { totalPoints: 0, testCount: 0 };
        }
        pupilStats[pupilId].totalPoints += point;
        pupilStats[pupilId].testCount += 1;
      });

      // Tính điểm trung bình và chuyển thành mảng
      const pupilAverages = Object.keys(pupilStats).map((pupilId) => ({
        pupilId,
        averagePoint:
          pupilStats[pupilId].totalPoints / pupilStats[pupilId].testCount,
        testCount: pupilStats[pupilId].testCount,
      }));

      // Sắp xếp theo điểm trung bình giảm dần và lấy top 10
      const top10Pupils = pupilAverages
        .sort((a, b) => b.averagePoint - a.averagePoint)
        .slice(0, 10);

      res.status(200).send({
        data: top10Pupils,
        message: {
          en: "Top 10 pupils by average point retrieved successfully",
          vi: "Lấy top 10 học sinh có điểm trung bình cao nhất thành công",
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

  // Get point statistic by lessons
  getPointStatsByLessons = async (req, res) => {
    try {
      const { grade, type, startDate, endDate } = req.query;

      // Parse thời gian nếu có
      let start, end;
      if (startDate) start = Timestamp.fromDate(new Date(startDate));
      if (endDate) end = Timestamp.fromDate(new Date(endDate));

      // 1. Lấy tất cả bài học phù hợp
      const lessonSnapshot = await getDocs(
        query(
          collection(db, "lessons"),
          where("grade", "==", parseInt(grade)),
          where("type", "==", type),
          where("isDisabled", "==", false)
        )
      );

      const results = [];

      for (const lessonDoc of lessonSnapshot.docs) {
        const lesson = lessonDoc.data();
        const lessonId = lessonDoc.id;

        // Hàm tạo query có điều kiện ngày nếu có
        const buildTestQuery = (pointCond) => {
          let q = query(
            collection(db, "tests"),
            where("lessonId", "==", lessonId),
            ...pointCond
          );
          if (start) q = query(q, where("createdAt", ">=", start));
          if (end) q = query(q, where("createdAt", "<=", end));
          return q;
        };

        // Các khoảng điểm
        const q9 = buildTestQuery([where("point", ">=", 9)]);
        const q7to9 = buildTestQuery([
          where("point", ">=", 7),
          where("point", "<", 9),
        ]);
        const q5to7 = buildTestQuery([
          where("point", ">=", 5),
          where("point", "<", 7),
        ]);
        const qlt5 = buildTestQuery([where("point", "<", 5)]);

        // Lấy count
        const count_9plus = await getCountFromServer(q9);
        const count_7to9 = await getCountFromServer(q7to9);
        const count_5to7 = await getCountFromServer(q5to7);
        const count_lt5 = await getCountFromServer(qlt5);

        results.push({
          lessonId,
          lessonName: lesson.name,
          counts: {
            "≥9": count_9plus.data().count,
            "≥7": count_7to9.data().count,
            "≥5": count_5to7.data().count,
            "<5": count_lt5.data().count,
          },
        });
      }

      res.status(200).json(results);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get point statistic by grade
  getPointStatsByGrade = async (req, res) => {
    try {
      const { grade, startDate, endDate } = req.query;

      // Parse thời gian nếu có
      let start, end;
      if (startDate) start = Timestamp.fromDate(new Date(startDate));
      if (endDate) end = Timestamp.fromDate(new Date(endDate));

      const gradeNumber = parseInt(grade);
      const types =
        gradeNumber === 1
          ? ["addition", "subtraction"]
          : ["addition", "subtraction", "multiplication", "division"];
      const results = [];
      for (const type of types) {
        // 1. Lấy tất cả bài học phù hợp
        const lessonSnapshot = await getDocs(
          query(
            collection(db, "lessons"),
            where("grade", "==", gradeNumber),
            where("type", "==", type),
            where("isDisabled", "==", false)
          )
        );

        let _9plus = 0;
        let _7to9 = 0;
        let _5to7 = 0;
        let _lt5 = 0;

        for (const lessonDoc of lessonSnapshot.docs) {
          const lessonId = lessonDoc.id;

          // Hàm tạo query có điều kiện ngày nếu có
          const buildTestQuery = (pointCond) => {
            let q = query(
              collection(db, "tests"),
              where("lessonId", "==", lessonId),
              ...pointCond
            );
            if (start) q = query(q, where("createdAt", ">=", start));
            if (end) q = query(q, where("createdAt", "<=", end));
            return q;
          };

          // Các khoảng điểm
          const q9 = buildTestQuery([where("point", ">=", 9)]);
          const q7to9 = buildTestQuery([
            where("point", ">=", 7),
            where("point", "<", 9),
          ]);
          const q5to7 = buildTestQuery([
            where("point", ">=", 5),
            where("point", "<", 7),
          ]);
          const qlt5 = buildTestQuery([where("point", "<", 5)]);

          // Lấy count
          _9plus += (await getCountFromServer(q9))?.data().count;
          _7to9 += (await getCountFromServer(q7to9))?.data().count;
          _5to7 += (await getCountFromServer(q5to7))?.data().count;
          _lt5 += (await getCountFromServer(qlt5))?.data().count;
        }
        results.push({
          mathType: type,
          counts: {
            "≥9": _9plus,
            "≥7": _7to9,
            "≥5": _5to7,
            "<5": _lt5,
          },
        });
      }

      res.status(200).json(results);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Thống kê top 10 bài tập có điểm trung bình cao nhất
  top10TestsByAveragePoint = async (req, res) => {
    try {
      // Lấy tất cả bài kiểm tra
      const snapshot = await getDocs(collection(db, "tests"));
      const tests = snapshot.docs.map((doc) => Tests.fromFirestore(doc));

      // Tạo object để lưu tổng điểm và số học sinh làm bài cho từng bài kiểm tra
      const testStats = {};

      // Duyệt qua các bài kiểm tra để tính tổng điểm và số học sinh
      tests.forEach((test) => {
        const { lessonId, point } = test;
        if (!testStats[lessonId]) {
          testStats[lessonId] = { totalPoints: 0, pupilCount: 0 };
        }
        testStats[lessonId].totalPoints += point;
        testStats[lessonId].pupilCount += 1;
      });

      // Tính điểm trung bình và chuyển thành mảng
      const testAverages = Object.keys(testStats).map((lessonId) => ({
        lessonId,
        averagePoint:
          testStats[lessonId].totalPoints / testStats[lessonId].pupilCount,
        pupilCount: testStats[lessonId].pupilCount,
      }));

      // Sắp xếp theo điểm trung bình giảm dần và lấy top 10
      const top10Tests = testAverages
        .sort((a, b) => b.averagePoint - a.averagePoint)
        .slice(0, 10);

      res.status(200).send({
        data: top10Tests,
        message: {
          en: "Top 10 tests by average point retrieved successfully",
          vi: "Lấy top 10 bài tập có điểm trung bình cao nhất thành công",
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

    // Get tests by lesson ID
    getTestsByLesson = async (req, res, next) => {
      try {
        const lessonId = req.params.lessonId;
        const q = query(
          collection(db, "tests"),
          where("lessonId", "==", lessonId)
        );
        const testSnapshot = await getDocs(q);
        const allTests = testSnapshot.docs.map((doc) =>
          Tests.fromFirestore(doc)
        );
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
        console.log(
          "Querying for lessonId:",
          pupilId,
          "and lessonId",
          lessonId
        ); // Debug log
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
  };

  getUserPointStatsComparison = async (req, res) => {
    try {
      const { pupilId } = req.params;
      const { grade, ranges, lessonId } = req.query;

      if (!pupilId || !grade || !lessonId) {
        return res.status(400).json({
          message: "Thiếu pupilId, lessonId (params) hoặc grade (query).",
        });
      }

      const gradeNumber = parseInt(grade);
      const expectedTypes =
        gradeNumber === 1
          ? ["addition", "subtraction"]
          : ["addition", "subtraction", "multiplication", "division"];

      const now = new Date();
      const startOfWeek = (d) => {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.getFullYear(), d.getMonth(), diff);
      };

      const thisWeekStart = startOfWeek(new Date(now));
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const currentQuarter = Math.floor(now.getMonth() / 3);
      const thisQuarterStart = new Date(
        now.getFullYear(),
        currentQuarter * 3,
        1
      );
      const lastQuarterStart = new Date(
        now.getFullYear(),
        (currentQuarter - 1) * 3,
        1
      );
      const lastQuarterEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);

      const timeRanges = {
        thisWeek: [Timestamp.fromDate(thisWeekStart), Timestamp.fromDate(now)],
        lastWeek: [
          Timestamp.fromDate(lastWeekStart),
          Timestamp.fromDate(lastWeekEnd),
        ],
        thisMonth: [
          Timestamp.fromDate(thisMonthStart),
          Timestamp.fromDate(now),
        ],
        lastMonth: [
          Timestamp.fromDate(lastMonthStart),
          Timestamp.fromDate(lastMonthEnd),
        ],
        thisQuarter: [
          Timestamp.fromDate(thisQuarterStart),
          Timestamp.fromDate(now),
        ],
        lastQuarter: [
          Timestamp.fromDate(lastQuarterStart),
          Timestamp.fromDate(lastQuarterEnd),
        ],
      };

      const requestedRanges = ranges && typeof ranges === "string"
        ? ranges
          .split(",")
          .map((r) => r.trim())
          .filter((r) => r in timeRanges)
        : Object.keys(timeRanges);

      const getPointStatsByType = async (start, end) => {
        const q = query(
          collection(db, "tests"),
          where("pupilId", "==", pupilId),
          where("lessonId", "==", lessonId),
          where("createdAt", ">=", start),
          where("createdAt", "<=", end)
        );
        const snapshot = await getDocs(q);
        const tests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (tests.length === 0) return {};

        const lessonDoc = await getDoc(doc(db, "lessons", lessonId));
        if (!lessonDoc.exists()) {
          return {};
        }
        const lessonType = lessonDoc.data().type;

        if (!expectedTypes.includes(lessonType)) {
          return {};
        }

        const stats = { [lessonType]: { "≥9": 0, "≥7": 0, "≥5": 0, "<5": 0 } };

        for (const test of tests) {
          const point = test.point;
          if (point >= 9) stats[lessonType]["≥9"]++;
          else if (point >= 7) stats[lessonType]["≥7"]++;
          else if (point >= 5) stats[lessonType]["≥5"]++;
          else stats[lessonType]["<5"]++;
        }

        return stats;
      };

      const result = {};

      for (const label of requestedRanges) {
        const [start, end] = timeRanges[label];
        const stats = await getPointStatsByType(start, end);

        const lessonDoc = await getDoc(doc(db, "lessons", lessonId));
        const lessonType = lessonDoc.exists() ? lessonDoc.data().type : null;

        if (lessonType && expectedTypes.includes(lessonType)) {
          if (!result[lessonType]) result[lessonType] = {};
          result[lessonType][label] = stats[lessonType] || {
            "≥9": 0,
            "≥7": 0,
            "≥5": 0,
            "<5": 0,
          };
        }
      }

      return res.status(200).json({
        pupilId,
        lessonId,
        grade: gradeNumber,
        compareByType: result,
      });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({
        message: {
          en: err.message,
          vi: "Đã xảy ra lỗi khi thống kê điểm theo kỹ năng.",
        },
      });
    }
  };
  // get true/false answer statitic by pupil
  getAnswerStats = async (req, res) => {
    try {
      const { pupilId } = req.params;
      const { grade, ranges } = req.query;

      if (!pupilId || !grade) {
        return res.status(400).json({ message: "Thiếu pupilId hoặc grade." });
      }

      const gradeNumber = parseInt(grade);
      const expectedTypes =
        gradeNumber === 1
          ? ["addition", "subtraction"]
          : ["addition", "subtraction", "multiplication", "division"];

      const now = new Date();
      const startOfWeek = (d) => {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.getFullYear(), d.getMonth(), diff);
      };

      const thisWeekStart = startOfWeek(now);
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const currentQuarter = Math.floor(now.getMonth() / 3);
      const thisQuarterStart = new Date(
        now.getFullYear(),
        currentQuarter * 3,
        1
      );
      const lastQuarterStart = new Date(
        now.getFullYear(),
        (currentQuarter - 1) * 3,
        1
      );
      const lastQuarterEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);

      const timeRanges = {
        thisWeek: [Timestamp.fromDate(thisWeekStart), Timestamp.fromDate(now)],
        lastWeek: [
          Timestamp.fromDate(lastWeekStart),
          Timestamp.fromDate(lastWeekEnd),
        ],
        thisMonth: [
          Timestamp.fromDate(thisMonthStart),
          Timestamp.fromDate(now),
        ],
        lastMonth: [
          Timestamp.fromDate(lastMonthStart),
          Timestamp.fromDate(lastMonthEnd),
        ],
        thisQuarter: [
          Timestamp.fromDate(thisQuarterStart),
          Timestamp.fromDate(now),
        ],
        lastQuarter: [
          Timestamp.fromDate(lastQuarterStart),
          Timestamp.fromDate(lastQuarterEnd),
        ],
      };

      const requestedRanges = ranges
        ? ranges
          .split(",")
          .map((r) => r.trim())
          .filter((r) => r in timeRanges)
        : Object.keys(timeRanges);

      // Khởi tạo map tạm: { type -> { range -> [ { levelId, correct, wrong } ] } }
      const resultMap = {};

      for (const label of requestedRanges) {
        const [start, end] = timeRanges[label];

        const q = query(
          collection(db, "test_questions"),
          where("createdAt", ">=", start),
          where("createdAt", "<=", end)
        );

        const snapshot = await getDocs(q);
        const questions = snapshot.docs;

        // Map testId → pupilId, lessonId
        const testCache = {};

        for (const docSnap of questions) {
          const data = docSnap.data();
          const testId = data.testId;
          if (!testId) continue;

          if (!testCache[testId]) {
            const testDoc = await getDoc(doc(db, "tests", testId));
            if (!testDoc.exists()) continue;
            testCache[testId] = testDoc.data();
          }

          const testData = testCache[testId];
          if (testData.pupilId !== pupilId) continue;

          const lessonId = testData.lessonId;
          const levelId = data.levelId || "unknown";

          // Lấy type từ lesson
          const lessonDoc = await getDoc(doc(db, "lessons", lessonId));
          if (!lessonDoc.exists()) continue;
          const lesson = lessonDoc.data();
          const type = lesson.type;
          if (!expectedTypes.includes(type)) continue;

          // Khởi tạo nếu chưa có
          if (!resultMap[type]) resultMap[type] = {};
          if (!resultMap[type][label]) resultMap[type][label] = {};
          if (!resultMap[type][label][levelId]) {
            resultMap[type][label][levelId] = { correct: 0, wrong: 0 };
          }

          const correctAnswer = data.correctAnswer;
          const selectedAnswer = data.selectedAnswer;
          const isCorrect =
            correctAnswer?.en?.trim() === selectedAnswer?.en?.trim() &&
            correctAnswer?.vi?.trim() === selectedAnswer?.vi?.trim();

          if (isCorrect) {
            resultMap[type][label][levelId].correct++;
          } else {
            resultMap[type][label][levelId].wrong++;
          }
        }
      }

      // mảng
      const statsByType = Object.entries(resultMap).map(([type, rangesObj]) => {
        const ranges = {};
        for (const [rangeName, levelMap] of Object.entries(rangesObj)) {
          ranges[rangeName] = Object.entries(levelMap).map(
            ([levelId, stats]) => ({
              levelId,
              ...stats,
            })
          );
        }
        for (const rangeName of requestedRanges) {
          if (!ranges[rangeName]) {
            ranges[rangeName] = [];
          }
        }

        return { type, ranges };
      });

      return res.status(200).json({
        pupilId,
        grade: gradeNumber,
        statsByType,
      });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({
        message: {
          en: err.message,
          vi: "Đã xảy ra lỗi khi thống kê câu đúng/sai theo kỹ năng.",
        },
      });
    }
  };
}

module.exports = new TestController();
