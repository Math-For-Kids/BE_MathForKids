const Goal = require("../models/Goal");
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
} = require("firebase/firestore");

const db = getFirestore();

class GoalController {

create = async (req, res, next) => {
    try {
      const { studentID, dateStart, dateEnd, type } = req.body;
      const goalData = {
        studentID,
        dateStart,
        dateEnd,
        type,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(collection(db, "goal"), goalData);
      res
        .status(200)
        .send({ message: "Goal created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

 
  getAll = async (req, res, next) => {
    try {
      const goalSnapshot = await getDocs(
        collection(db, "goal")
      );
      const goals = goalSnapshot.docs.map((doc) =>
        Goal.fromFirestore(doc)
      );
      res.status(200).send(goals);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
    
     
      getById = async (req, res, next) => {
        try {
          const id = req.params.id;
          const goal = doc(db, "goal", id);
          const data = await getDoc(goal);
          const goalData = Goal.fromFirestore(data);
          if (data.exists()) {
            res.status(200).send(goalData);
          } else {
            res.status(404).send({ message: "goal not found!" });
          }
        } catch (error) {
          res.status(400).send({ message: error.message });
        }
      };
    
        update = async (req, res, next) => {
          try {
            const id = req.params.id;
            const { studentID, dateStart, dateEnd, type } = req.body;
            const ref = doc(db, "goal", id);
            await updateDoc(ref, {
                studentID,
                dateStart,
                dateEnd,
                type,
              updatedAt: serverTimestamp(),
            });
            res
              .status(200)
              .send({ message: "Goal updated successfully!" });
          } catch (error) {
            res.status(400).send({ message: error.message });
          }
        };

          delete = async (req, res, next) => {
            try {
              const id = req.params.id;
              await deleteDoc(doc(db, "goal", id));
              res
                .status(200)
                .send({ message: "Goal deleted successfully!" });
            } catch (error) {
              res.status(400).send({ message: error.message });
            }
          };
   
}

module.exports = new GoalController();
