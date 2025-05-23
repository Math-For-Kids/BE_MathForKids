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
    where
} = require("firebase/firestore");
const db = getFirestore();

class TestController {
    create = async (req, res, next) => {
        try {
            const data = req.body;
            await addDoc(collection(db, "tests"), {
                ...data,
                createAt: serverTimestamp(),
                updateAt: serverTimestamp(),
            });
            res.status(200).send({ message: "Tests created successfully" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    getAll = async (req, res, next) => {
        try {
            const tests = await getDocs(
                collection(db, "tests")
            );
            const testData = tests.docs.map((doc) =>
                Tests.fromFirestore(doc)
            );
            res.status(200).send(testData);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    getByLessonId = async (req, res, next) => {
        try {
            const lessonId = req.params.lessonId;
            const q = query(
                collection(db, "tests"),
                where("lessonId", "==", lessonId),
                where("isDisabled", "==", false)
            );
            const test = await getDocs(q);
            const testArray = test.docs.map((doc) =>
                Tests.fromFirestore(doc)
            );
            res.status(200).send(testArray);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    getByExerciseId = async (req, res, next) => {
        try {
            const exerciseId = req.params.exerciseId;
            const q = query(
                collection(db, "tests"),
                where("exerciseId", "==", exerciseId),
                where("isDisabled", "==", false)
            );
            const test = await getDocs(q);
            const testArray = test.docs.map((doc) =>
                Tests.fromFirestore(doc)
            );
            res.status(200).send(testArray);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    getById = async (req, res, next) => {
        try {
            const id = req.params.id;
            const test = doc(db, "tests", id);
            const data = await getDoc(test);
            if (data.exists() && !data.data().isDisabled) {
                const testData = Tests.fromFirestore(data);
                res.status(200).send(testData);
            } else {
                res.status(404).send({ message: "Test not found!" });
            }
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    update = async (req, res, next) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const test = doc(db, "tests", id);
            await updateDoc(test, { ...data, updateAt: serverTimestamp() });
            res.status(200).send({ message: "Test updated successfully!" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    delete = async (req, res, next) => {
        try {
            const id = req.params.id;
            const test = doc(db, "tests", id);
            await updateDoc(test, {
                isDisabled: true,
                updateAt: serverTimestamp(),
            });
            res.status(200).send({ message: "Test deleted successfully!" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
}
module.exports = new TestController();