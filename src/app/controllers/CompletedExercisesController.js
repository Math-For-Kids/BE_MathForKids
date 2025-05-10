const CompletedExercises = require("../models/CompletedExercises");
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

class CompletedExercisesController {
    create = async (req, res, next) => {
        try {
            const data = req.body;
            await addDoc(collection(db, "completed_exercises"), {
                ...data,
                createAt: serverTimestamp(),
                updateAt: serverTimestamp(),
            });
            res.status(200).send({ message: "Completed exercise created successfully!" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    getAll = async (req, res, next) => {
        try {
            const completeexercise = await getDocs(
                collection(db, "completed_exercises")
            );
            const completeexerciseData = completeexercise.docs.map((doc) =>
                CompletedExercises.fromFirestore(doc)
            );
            res.status(200).send(completeexerciseData);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    getByExerciseId = async (req, res, next) => {
        try {
            const exerciseId = req.params.exerciseId;
            const q = query(
                collection(db, "completed_exercises"),
                where("exerciseId", "==", exerciseId)
            );
            const questions = await getDocs(q);
            const questionArray = questions.docs.map((doc) =>
                CompletedExercises.fromFirestore(doc)
            );
            res.status(200).send(questionArray);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    getById = async (req, res, next) => {
        try {
            const id = req.params.id;
            const completed_exercises = doc(db, "completed_exercises", id);
            const data = await getDoc(completed_exercises);
            const completed_exercisesData = CompletedExercises.fromFirestore(data);
            if (data.exists()) {
                res.status(200).send(completed_exercisesData);
            } else {
                res.status(404).send({ message: "Completed exercise not found!" });
            }
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    update = async (req, res, next) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const completed_exercises = doc(db, "completed_exercises", id);
            await updateDoc(completed_exercises, { ...data, updateAt: serverTimestamp() });
            res.status(200).send({ message: "Completed exercise updated successfully" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    delete = async (req, res, next) => {
        try {
            const id = req.params.id;
            await deleteDoc(doc(db, "completed_exercises", id));
            res.status(200).send({ message: "Question deleted successfully!" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
}
module.exports = new CompletedExercisesController();