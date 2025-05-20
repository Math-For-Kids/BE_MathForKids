const Level = require("../models/Level");
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

class LevelController {

    create = async (req, res) => {
        try {
            const data = req.body;
            const newDocRef = await addDoc(collection(db, "levels"), {
                ...data,
                isDisabled: data.isDisabled ?? false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            const newDocSnapshot = await getDoc(newDocRef);
            const level = Level.fromFirestore(newDocSnapshot);
            res.status(200).send(level);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    getAll = async (req, res) => {
        try {
            const snapshot = await getDocs(collection(db, "levels"));
            const levels = snapshot.docs.map(doc => Level.fromFirestore(doc));
            res.status(200).send(levels);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    getEnabledLevels = async (req, res) => {
        try {
            const levelsRef = collection(db, "levels");
            const q = query(levelsRef, where("isDisabled", "==", false));
            const snapshot = await getDocs(q);
            const levels = snapshot.docs.map(doc => Level.fromFirestore(doc));
            res.status(200).send(levels);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };


    getById = async (req, res) => {
        try {
            const levelId = req.params.id;
            const docRef = doc(db, "levels", levelId);
            const snapshot = await getDoc(docRef);
            if (!snapshot.exists()) {
                return res.status(404).send({ message: "Level not found" });
            }
            const level = Level.fromFirestore(snapshot);
            res.status(200).send(level);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    update = async (req, res) => {
        try {
            const levelId = req.params.id;
            const data = req.body;
            const docRef = doc(db, "levels", levelId);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });
            const updatedDoc = await getDoc(docRef);
            const level = Level.fromFirestore(updatedDoc);
            res.status(200).send(level);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    delete = async (req, res) => {
        try {
            const levelId = req.params.id;
            await deleteDoc(doc(db, "levels", levelId));
            res.status(200).send({ message: "Level deleted successfully!" });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
}

module.exports = new LevelController();
