const {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  query,
  where,
} = require("firebase/firestore");

const LessonDetail = require("../models/LessonDetail");
const db = getFirestore();
const { uploadMultipleFiles } = require("./fileController");

class LessonDetailController {
  static fromFirestore(doc) {
    const data = doc.data();
    return {
      id: doc.id,
      lessonId: data.lessonId,
      order: data.order,
      title: data.title,
      content: data.content,
      image: data.image || null,
      isDisabled: data.isDisabled ?? false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
  // Tạo 1 phần
  create = async (req, res) => {
    try {
      const { lessonId, order, title, content } = req.body;
      if (!lessonId || !order || !title || !content) {
        return res.status(400).send({ message: "Missing required fields." });
      }
      let uploadedFiles = {};
      if (req.files && Object.keys(req.files).length > 0) {
        uploadedFiles = await uploadMultipleFiles(req.files);
      }
      const image = uploadedFiles["image"] || null;
      const parsedTitle = typeof title === "string" ? JSON.parse(title) : title;
      const parsedContent =
        typeof content === "string" ? JSON.parse(content) : content;
      await addDoc(collection(db, "lesson_details"), {
        lessonId,
        order: Number(order),
        title: parsedTitle,
        content: parsedContent,
        image,
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
      const { lessonId, contents } = req.body;
      if (
        !lessonId ||
        !contents?.define ||
        !contents?.example ||
        !contents?.remember
      ) {
        return res.status(400).send({ message: "Missing required fields." });
      }
      let uploadedFiles = {};
      if (req.files && Object.keys(req.files).length > 0) {
        uploadedFiles = await uploadMultipleFiles(req.files);
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
          content:
            typeof contents.define === "string"
              ? JSON.parse(contents.define)
              : contents.define,
          image: uploadedFiles["define"] || null,
        }),
        addDoc(collectionRef, {
          ...baseData,
          order: 2,
          title: { vi: "Bài tập", en: "Exercise" },
          content:
            typeof contents.example === "string"
              ? JSON.parse(contents.example)
              : contents.example,
          image: uploadedFiles["example"] || null,
        }),
        addDoc(collectionRef, {
          ...baseData,
          order: 3,
          title: { vi: "Ghi nhớ", en: "Remember" },
          content:
            typeof contents.remember === "string"
              ? JSON.parse(contents.remember)
              : contents.remember,
          image: uploadedFiles["remember"] || null,
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
      if (!id) return res.status(400).send({ message: "Missing ID." });

      const docRef = doc(db, "lesson_details", id);
      const { title, content, order, ...rest } = req.body;
      const parsedTitle = typeof title === "string" ? JSON.parse(title) : title;
      const parsedContent =
        typeof content === "string" ? JSON.parse(content) : content;
      let uploadedFiles = {};
      if (req.files && Object.keys(req.files).length > 0) {
        uploadedFiles = await uploadMultipleFiles(req.files);
      }
      const image = uploadedFiles["image"] || null;
      await updateDoc(docRef, {
        ...rest,
        ...(order && { order: Number(order) }),
        ...(parsedTitle && { title: parsedTitle }),
        ...(parsedContent && { content: parsedContent }),
        ...(image && { image }),
        updatedAt: serverTimestamp(),
      });

      res.status(200).send({ message: "Lesson detail updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  // Cập nhật theo lessonId và order
  updateByLessonIdAndOrder = async (req, res) => {
    try {
      const { lessonId, order } = req.params;
      const { createdAt, ...data } = req.body;

      const q = query(
        collection(db, "lesson_details"),
        where("lessonId", "==", lessonId),
        where("order", "==", parseInt(order)),
        where("isDisabled", "==", false)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return res.status(404).send({ message: "Lesson detail not found!" });
      }

      const docRef = snapshot.docs[0].ref;

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
      const { lessonId } = req.params;

      const q = query(
        collection(db, "lesson_details"),
        where("lessonId", "==", lessonId)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return res
          .status(404)
          .send({ message: "No lesson details found for this lessonId." });
      }

      const deletePromises = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "lesson_details", docSnap.id))
      );

      await Promise.all(deletePromises);

      res
        .status(200)
        .send({ message: `Deleted ${deletePromises.length} lesson details.` });
    } catch (error) {
      console.error("Delete by lessonId error:", error);
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new LessonDetailController();
