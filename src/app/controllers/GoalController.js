const Goal = require("../models/Goal");
const {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} = require("firebase/firestore");

const db = getFirestore();
// ✅ Hàm chuẩn hóa: chỉ giữ lại phần ngày
function toDateOnly(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
class GoalController {
  parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  };

  // Create goal
  create = async (req, res) => {
    try {
      const data = req.body;
      const newDocRef = await addDoc(collection(db, "goal"), {
        ...data,
        isCompleted: false,
        createdAt: serverTimestamp(),
      });
      res.status(201).send({
        message: {
          en: "Goal created successfully!",
          vi: "Tạo mục tiêu thành công!",
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

  // Update goal
  update = async (req, res) => {
    try {
      const goalId = req.params.id;
      const { createdAt, ...data } = req.body;

      const docRef = doc(db, "goal", goalId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      res.status(200).send({
        message: {
          en: "Goal updated successfully!",
          vi: "Cập nhật mục tiêu thành công!",
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

  // Get within 30 days by pupilId
  getWithin30DaysByPupilId = async (req, res) => {
    try {
      const { pupilId } = req.params;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const q = query(
        collection(db, "goal"),
        where("pupilId", "==", pupilId),
        where("createdAt", ">=", thirtyDaysAgo),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const goals = snapshot.docs.map((doc) => Goal.fromFirestore(doc));

      res.status(200).send(goals);
    } catch (error) {
      console.error("getWithin30DaysByPupilId Error:", error);
      res.status(500).send({
        message: {
          en: error.message || "Internal error",
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  getById = async (req, res) => {
    const id = req.params.id;
    const goal = req.goal;
    res.status(200).send({ id: id, ...goal });
  };

  //cập nhật nhiệm vụ đã hoàn thành
  autoMarkCompletedGoals = async (req, res) => {
    try {
      const { pupilId, goalId, lessonId } = req.params;
      // console.log("Params:", { pupilId, goalId, lessonId });

      if (!pupilId || !goalId || !lessonId) {
        return res.status(400).send({
          message: {
            en: "Missing pupilId, goalId, or lessonId",
            vi: "Thiếu pupilId, goalId hoặc lessonId",
          },
        });
      }

      // 1. Lấy goal tương ứng
      const goalDoc = await getDoc(doc(db, "goal", goalId));
      if (!goalDoc.exists()) {
        return res.status(404).send({
          message: {
            en: "Goal not found",
            vi: "Không tìm thấy nhiệm vụ",
          },
        });
      }

      const goal = { id: goalDoc.id, ...goalDoc.data() };
      // console.log("Goal:", goal);

      const {
        dateStart,
        dateEnd,
        isCompleted,
        exercise,
        rewardId,
        rewardQuantity,
      } = goal;

      if (
        goal.pupilId !== pupilId ||
        goal.lessonId !== lessonId ||
        isCompleted ||
        !dateStart ||
        !dateEnd
      ) {
        // console.log("Goal không hợp lệ hoặc đã hoàn thành");
        return res.status(400).send({
          message: {
            en: "Invalid or already completed goal",
            vi: "Nhiệm vụ không hợp lệ hoặc đã hoàn thành",
          },
        });
      }

      // 2. Lấy completed_lesson liên quan
      // console.log("Đang truy vấn completed_lessons...");
      const completedLessonsSnap = await getDocs(
        query(
          collection(db, "completed_lessons"),
          where("pupilId", "==", pupilId),
          where("lessonId", "==", lessonId)
        )
      );
      const completedLessons = completedLessonsSnap.docs.map((doc) =>
        doc.data()
      );
      console.log("completed_lessons:", completedLessons);

      // 3. Lấy completed_exercises
      const exerciseSnap = await getDocs(
        query(
          collection(db, "completed_exercises"),
          where("pupilId", "==", pupilId),
          where("lessonId", "==", lessonId)
        )
      );
      const completedExercises = exerciseSnap.docs
        .map((doc) => {
          const data = doc.data();
          let createdAt = null;

          if (typeof data.createAt?.toDate === "function") {
            createdAt = data.createAt.toDate();
          } else if (data.createAt) {
            const parsed = new Date(data.createAt);
            if (!isNaN(parsed)) createdAt = parsed;
          }

          return createdAt
            ? {
                ...data,
                createdAt,
                createdDay: createdAt.toISOString().split("T")[0],
              }
            : null;
        })
        .filter(Boolean);
      // console.log("completed_exercises:", completedExercises);

      // 4. Kiểm tra lesson match
      const matchingLesson = completedLessons.find((cl) => {
        const updated = toDateOnly(
          cl.updatedAt?.toDate?.() || new Date(cl.updatedAt)
        );
        const start = toDateOnly(dateStart);
        const end = toDateOnly(dateEnd);
        const match =
          cl.lessonId === lessonId &&
          cl.isCompleted &&
          updated >= start &&
          updated <= end;
        // console.log("Check lesson:", {
        //   lessonId: cl.lessonId,
        //   updated,
        //   match,
        // });
        return match;
      });

      // 5. Kiểm tra exercise match
      const matchedExercise = completedExercises.find((ex) => {
        const exLevelMatch = (exercise || []).every((level) =>
          (ex.levelId || []).includes(level)
        );
        const updated = toDateOnly(ex.createdAt);
        const start = toDateOnly(dateStart);
        const end = toDateOnly(dateEnd);
        const match =
          ex.lessonId === lessonId &&
          exLevelMatch &&
          updated >= start &&
          updated <= end;
        // console.log("Check exercise:", {
        //   lessonId: ex.lessonId,
        //   exLevelMatch,
        //   updated,
        //   match,
        // });
        return match;
      });

      if (matchingLesson || matchedExercise) {
        const matched = matchingLesson || matchedExercise;
        // console.log("Goal hoàn thành, matched:", matched);

        await updateDoc(doc(db, "goal", goal.id), {
          isCompleted: true,
          completedAt: matched.createdAt,
          updatedAt: serverTimestamp(),
        });

        // Tăng phần thưởng nếu có
        const rewardRef = collection(db, "owned_rewards");
        const ownedRewardQuery = query(
          rewardRef,
          where("pupilId", "==", pupilId),
          where("rewardId", "==", rewardId)
        );
        const ownedRewardSnap = await getDocs(ownedRewardQuery);

        if (!ownedRewardSnap.empty) {
          const existingDoc = ownedRewardSnap.docs[0];
          const existingData = existingDoc.data();
          const newQuantity =
            (existingData.quantity || 0) + Number(rewardQuantity || 0);

          // console.log("Tăng số lượng reward:", newQuantity);

          await updateDoc(doc(db, "owned_rewards", existingDoc.id), {
            quantity: newQuantity,
            updatedAt: serverTimestamp(),
          });
        } else {
          // console.log("Thêm mới phần thưởng");
          await addDoc(rewardRef, {
            pupilId,
            rewardId,
            quantity: Number(rewardQuantity || 0),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        const lessonDoc = await getDoc(doc(db, "lessons", goal.lessonId));
        const lessonName =
          lessonDoc.exists() && lessonDoc.data().name?.vi
            ? lessonDoc.data().name.vi
            : "nhiệm vụ";

        return res.status(200).send({
          message: {
            en: `Goal "${lessonName}" marked as completed.`,
            vi: `Chúc mừng bạn đã hoàn thành nhiệm vụ "${lessonName}".`,
          },
        });
      } else {
        // console.log("Không tìm thấy bài học hoặc bài tập phù hợp");
        return res.status(200).send({
          message: {
            en: "No matching completed lesson or exercise found.",
            vi: "Không tìm thấy bài học hoặc bài tập phù hợp.",
          },
        });
      }
    } catch (error) {
      console.error("autoMarkCompletedGoals Error:", error);
      res.status(500).send({
        message: {
          en: error.message || "Internal error",
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  //lấy các lesson chưa set goal full level
  getAvailableLessons = async (req, res) => {
    try {
      const { pupilId, skillType, startDate, endDate } = req.params;

      if (!pupilId || !skillType || !startDate || !endDate) {
        return res.status(400).send({
          message: {
            en: "Missing required parameters",
            vi: "Thiếu tham số bắt buộc",
          },
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "goal"),
        where("pupilId", "==", pupilId),
        where("skillType", "==", skillType),
        where("isCompleted", "==", false)
      );
      const snapshot = await getDocs(q);

      const levelOptions = ["Easy", "Medium", "Hard"];
      const resultMap = {};

      snapshot.forEach((doc) => {
        const goal = doc.data();
        const gStart = new Date(goal.dateStart);
        gStart.setHours(0, 0, 0, 0);
        const gEnd = new Date(goal.dateEnd);
        gEnd.setHours(23, 59, 59, 999);

        const isOverlap = gStart <= end && gEnd >= start;
        if (!isOverlap) return;

        const lessonId = goal.lessonId;
        if (!lessonId) return;

        if (!resultMap[lessonId]) {
          resultMap[lessonId] = new Set();
        }

        (goal.exercise || []).forEach((e) => resultMap[lessonId].add(e));
      });

      const availableLessons = [];
      for (const lessonId in resultMap) {
        const disabledSet = resultMap[lessonId];
        const allLevelsCovered = levelOptions.every((lv) =>
          disabledSet.has(lv)
        );

        if (!allLevelsCovered) {
          availableLessons.push({
            lessonId,
            disabledExercises: Array.from(disabledSet),
          });
        }
      }

      res.status(200).send(availableLessons);
    } catch (error) {
      console.error("getAvailableLessons Error:", error);
      res.status(500).send({
        message: {
          en: error.message || "Internal error",
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };
}

module.exports = new GoalController();
