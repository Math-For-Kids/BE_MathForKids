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
  query,
  where,
  Timestamp,
} = require("firebase/firestore");

const db = getFirestore();

class PupilController {

  create = async (req, res, next) => {
    try {
      const data = req.body;
      const date = new Date(data.dateOfBirth); 
      const dateOfBirthTimestamp = Timestamp.fromDate(date);
      await addDoc(collection(db, "pupils"), {
        ...data,
        dateOfBirth: dateOfBirthTimestamp,
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

  getEnabledPupil = async (req, res) => {
    try {
      const pupilsRef = collection(db, "pupils");
      const q = query(pupilsRef, where("isDisabled", "==", false));
      const snapshot = await getDocs(q);
      const pupils = snapshot.docs.map(doc => Pupil.fromFirestore(doc));
      res.status(200).send(pupils);
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
      const { createdAt, dateOfBirth, ...data } = req.body;

      // Nếu có trường dateOfBirth thì chuyển thành Timestamp
      if (dateOfBirth) {
        const date = new Date(dateOfBirth);
        data.dateOfBirth = Timestamp.fromDate(date);
      }
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
      const { createdAt, dateOfBirth, ...data } = req.body;
      const pupilRef = doc(db, "pupils", id);
      await updateDoc(pupilRef, { ...data, updatedAt: serverTimestamp() });
      res.status(200).send({ message: "Pupil disabled successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  
  countPupils = async (req, res, next) => {
    try {
      const pupilSnapshot = await getDocs(collection(db, "pupils"));
      const pupilCount = pupilSnapshot.size;
      res.status(200).send({ count: pupilCount });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

}

module.exports = new PupilController();
