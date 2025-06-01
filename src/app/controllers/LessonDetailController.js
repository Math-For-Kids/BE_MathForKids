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
      console.log('Dữ liệu nhận được:', { body: req.body, files: Object.keys(req.files || {}) });
      const { lessonId, contents } = req.body;

      // Kiểm tra các trường bắt buộc
      if (!lessonId || !contents) {
        console.error('Lỗi: Thiếu lessonId hoặc contents', { lessonId, contents });
        return res.status(400).send({ message: "Thiếu lessonId hoặc contents." });
      }

      // Parse contents
      let parsedContents;
      try {
        parsedContents = typeof contents === "string" ? JSON.parse(contents) : contents;
        console.log('Parsed contents:', parsedContents);
        if (!parsedContents.define || !parsedContents.example || !parsedContents.remember) {
          console.error('Lỗi: Contents thiếu define, example hoặc remember', parsedContents);
          return res.status(400).send({ message: "Contents thiếu define, example hoặc remember." });
        }
      } catch (error) {
        console.error('Lỗi khi parse contents:', error);
        return res.status(400).send({ message: "Dữ liệu contents không hợp lệ: " + error.message });
      }

      // Xử lý file upload
      let uploadedFiles = {};
      if (req.files && Object.keys(req.files).length > 0) {
        try {
          uploadedFiles = await uploadMultipleFiles(req.files);
          console.log('File đã upload:', uploadedFiles);
        } catch (error) {
          console.error('Lỗi khi upload file:', error);
          return res.status(400).send({ message: "Lỗi khi upload file: " + error.message });
        }
      }

      const baseData = {
        lessonId,
        isDisabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const collectionRef = collection(db, "lesson_details");

      // Tạo 3 bản ghi
      await Promise.all([
        addDoc(collectionRef, {
          ...baseData,
          order: 1,
          title: { vi: "Định nghĩa", en: "Define" },
          content: parsedContents.define,
          image: uploadedFiles.define || null,
        }).catch((err) => {
          console.error('Lỗi khi thêm Define:', err);
          throw err;
        }),
        addDoc(collectionRef, {
          ...baseData,
          order: 2,
          title: { vi: "Bài tập", en: "Example" },
          content: parsedContents.example,
          image: uploadedFiles.example || null,
        }).catch((err) => {
          console.error('Lỗi khi thêm Example:', err);
          throw err;
        }),
        addDoc(collectionRef, {
          ...baseData,
          order: 3,
          title: { vi: "Ghi nhớ", en: "Remember" },
          content: parsedContents.remember,
          image: uploadedFiles.remember || null,
        }).catch((err) => {
          console.error('Lỗi khi thêm Remember:', err);
          throw err;
        }),
      ]);

      res.status(200).send({ message: "Tạo full lesson thành công!" });
    } catch (error) {
      console.error('Lỗi trong createFullLesson:', error);
      res.status(400).send({ message: `Lỗi khi tạo full lesson: ${error.message}` });
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
}
module.exports = new LessonDetailController();
