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
} = require("firebase/firestore");

const LessonDetail = require("../models/LessonDetail");
const db = getFirestore();

class LessonDetailController {
  // Tạo 1 phần
  create = async (req, res) => {
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

  // Tạo liền 3 phần: Define, Example, Remember
  createFullLesson = async (req, res) => {
    try {
      const { lessonId, contents, images = {} } = req.body;

      if (
        !lessonId ||
        !contents?.define ||
        !contents?.example ||
        !contents?.remember
      ) {
        return res.status(400).send({ message: "Missing required fields." });
      }

      const baseData = {
        lessonId,
        isDisabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const collectionRef = collection(db, "lesson_details");

      await Promise.all([
        addDoc(collectionRef, {
          ...baseData,
          order: 1,
          title: { vi: "Định nghĩa", en: "Define" },
          content: contents.define,
          image: images.define || null,
        }),
        addDoc(collectionRef, {
          ...baseData,
          order: 2,
          title: { vi: "Bài tập", en: "Exercise" },
          content: contents.example,
          image: images.example || null,
        }),
        addDoc(collectionRef, {
          ...baseData,
          order: 3,
          title: { vi: "Ghi nhớ", en: "Remember" },
          content: contents.remember,
          image: images.remember || null,
        }),
      ]);

      res
        .status(200)
        .send({ message: "All lesson details created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  // Lấy theo lessonId
  getByLessonId = async (req, res) => {
    try {
      const { lessonId } = req.params;
      const q = query(
        collection(db, "lesson_details"),
        where("lessonId", "==", lessonId),
        where("isDisabled", "==", false)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map((doc) => LessonDetail.fromFirestore(doc))
        .sort((a, b) => a.order - b.order);
      res.status(200).send(list);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  // Lấy theo ID
  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const docRef = doc(db, "lesson_details", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return res.status(404).send({ message: "Lesson detail not found!" });
      }
      res.status(200).send(LessonDetail.fromFirestore(docSnap));
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  // Cập nhật
  update = async (req, res) => {
    try {
      const { id } = req.params;
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

  // Vô hiệu hoá
  delete = async (req, res) => {
    try {
      const { id } = req.params;
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
}

module.exports = new LessonDetailController();
