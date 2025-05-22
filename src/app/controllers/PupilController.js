const Pupil = require("../models/Pupil");
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
} = require("firebase/firestore");

const db = getFirestore();

class PupilController {

  create = async (req, res, next) => {
    try {
      const data = req.body;
      await addDoc(collection(db, "pupils"), {
        ...data,
        isDisabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Pupil created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  getAll = async (req, res, next) => {
    try {
      const pupils = await getDocs(collection(db, "pupils"));
      const pupilArray = pupils.docs.map((doc) => Pupil.fromFirestore(doc));
      res.status(200).send(pupilArray);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

 
  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const pupilRef = doc(db, "pupils", id);
      const data = await getDoc(pupilRef);
      if (data.exists()) {
        const pupilData = Pupil.fromFirestore(data);
        res.status(200).send(pupilData);
      } else {
        res.status(404).send({ message: "Pupil not found!" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const pupilRef = doc(db, "pupils", id);
      await updateDoc(pupilRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      res.status(200).send({ message: "Pupil updated successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  // Xóa học sinh
  delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      await deleteDoc(doc(db, "pupils", id));
      res.status(200).send({ message: "Pupil deleted successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
}

module.exports = new PupilController();
