const {
  getFirestore,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where,
  Timestamp,
} = require("firebase/firestore");
const db = getFirestore();

class LevelMiddleware {
  // Check level is already exist or not by ID
  checkLevelExistById = (paramName = "id") => {
    return async (req, res, next) => {
      try {
        const levelId = req.params[paramName];
        const levelRef = doc(db, "levels", levelId);
        const levelSnap = await getDoc(levelRef);

        if (!levelSnap.exists()) {
          return res.status(404).json({
            message: {
              en: "Level not found!",
              vi: "Không tìm thấy cấp độ!",
            },
          });
        }
        req.level = levelSnap.data();
        return next();
      } catch (error) {
        return res.status(500).json({
          message: {
            en: error.message,
            vi: "Đã xảy ra lỗi nội bộ.",
          },
        });
      }
    };
  };
}

module.exports = new LevelMiddleware();
