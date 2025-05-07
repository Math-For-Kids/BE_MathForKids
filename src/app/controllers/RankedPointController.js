const Rankpoints = require("../models/RankedPoints");
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

class RankedPointController {
    create = async (req, res, next) => {
        try {
            const data = req.body;
            await addDoc(collection(db, "ranked_points"), {
                ...data,
                createdAt: serverTimestamp(),
                updateAt: serverTimestamp(),
            });
            res.status(200).send({ message: "RankedPoints created successfully" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    getAll = async (req, res, next) => {
        try {
            const rankpoint = await getDocs(
                collection(db, "ranked_points")
            );
            const rankpointData = rankpoint.docs.map((doc) =>
                Rankpoints.fromFirestore(doc)
            );
            res.status(200).send(rankpointData);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    getByLessonId = async (req, res, next) => {
        try {
            const lessonId = req.params.lessonId;
            const q = query(
                collection(db, "ranked_points"),
                where("lessonId", "==", lessonId)
            );
            const ranked_points = await getDocs(q);
            const rankedArray = ranked_points.docs.map((doc) =>
                Rankpoints.fromFirestore(doc)
            );
            res.status(200).send(rankedArray);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    getByStudentId = async (req, res, next) => {
        try {
            const studentId = req.params.studentId;
            const q = query(
                collection(db, "ranked_points"),
                where("studentId", "==", studentId)
            );
            const ranked_points = await getDocs(q);
            const rankedArray = ranked_points.docs.map((doc) =>
                Rankpoints.fromFirestore(doc)
            );
            res.status(200).send(rankedArray);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    getById = async (req, res, next) => {
        try {
            const id = req.params.id;
            const ranked_points = doc(db, "ranked_points", id);
            const data = await getDoc(ranked_points);
            const ranked_points_Data = Rankpoints.fromFirestore(data);
            if (data.exists()) {
                res.status(200).send(ranked_points_Data);
            } else {
                res.status(404).send({ message: "RankedPoint not found!" });
            }
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    update = async (req, res, next) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const ranked_points = doc(db, "ranked_points", id);
            await updateDoc(ranked_points, { ...data, updateAt: serverTimestamp() });
            res.status(200).send({ message: "RankedPoint updated successfully!" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
    delete = async (req, res, next) => {
        try {
            const id = req.params.id;
            await deleteDoc(doc(db, "ranked_points", id));
            res.status(200).send({ message: "RankedPoint deleted successfully!" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
}
module.exports = new RankedPointController();
