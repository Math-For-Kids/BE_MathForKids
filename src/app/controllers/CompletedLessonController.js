const CompletedLesson = require("../models/CompletedLesson");
const {
    getFirestore,
    collection,
    doc,
    getDoc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    where,
} = require("firebase/firestore");
const db = getFirestore();

class CompletedLessonController {
    create = async (req, res, next) => {
        try {
            const data = req.body;
            await addDoc(collection(db, "completed_lessons"), {
                ...data,
                createAt: serverTimestamp(),
                updateAt: serverTimestamp(),
            });
            res.status(200).send({ message: "Completed lesson created successfully!" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    getAll = async (req, res, next) => {
        try {
            const complete_lesson = await getDocs(
                collection(db, "completed_lessons")
            );
            const completeLessonData = complete_lesson.docs.map((doc) =>
                CompletedLesson.fromFirestore(doc)
            );
            res.status(200).send(completeLessonData);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    getByLessonId = async (req, res, next) => {
        try {
            const lessonId = req.params.lessonId;
            const q = query(
                collection(db, "completed_lessons"),
                where("lessonId", "==", lessonId)
            );
            const questions = await getDocs(q);
            const questionArray = questions.docs.map((doc) =>
                CompletedLesson.fromFirestore(doc)
            );
            res.status(200).send(questionArray);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    getById = async (req, res, next) => {
        try {
            const id = req.params.id;
            const completed_lessons = doc(db, "completed_lessons", id);
            const data = await getDoc(completed_lessons);
            const completed_lessonsData = CompletedLesson.fromFirestore(data);
            if (data.exists()) {
                res.status(200).send(completed_lessonsData);
            } else {
                res.status(404).send({ message: "Completed lesson not found!" });
            }
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    update = async (req, res, next) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const completed_lessons = doc(db, "completed_lessons", id);
            await updateDoc(completed_lessons, { ...data, updateAt: serverTimestamp() });
            res.status(200).send({ message: "Completed lesson updated successfully" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    delete = async (req, res, next) => {
        try {
            const id = req.params.id;
            await deleteDoc(doc(db, "completed_lessons", id));
            res.status(200).send({ message: "Question deleted successfully!" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
}
module.exports = new CompletedLessonController();