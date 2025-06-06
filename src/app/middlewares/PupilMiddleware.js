const {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
  Timestamp,
} = require("firebase/firestore");
const db = getFirestore();

class PupilMiddleware {
  // Check pupil is already exist or not by ID
  checkPupilExistById = (paramName = "id") => {
    return async (req, res, next) => {
      try {
        const pupilId = req.params[paramName];
        const pupilRef = doc(db, "pupils", pupilId);
        const pupilSnap = await getDoc(pupilRef);

        if (!pupilSnap.exists()) {
          return res.status(404).json({
            message: {
              en: "Pupil not found!",
              vi: "Không tìm thấy học sinh!",
            },
          });
        }
        req.pupil = pupilSnap.data();
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

module.exports = new PupilMiddleware();
