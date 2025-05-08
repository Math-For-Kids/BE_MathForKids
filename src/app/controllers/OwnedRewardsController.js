const OwnedRewards = require("../models/OwnedRewards");
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

class OwnedRewardsController {

create = async (req, res, next) => {
    try {
      const { studentId, rewardId, number } = req.body;
      const OwnedRewardsdData = {
        studentId,
        rewardId,
        number,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(collection(db, "owned_rewards"), OwnedRewardsdData);
      res
        .status(200)
        .send({ message: "Owned_Rewards created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

 
  getAll = async (req, res, next) => {
    try {
      const ownedrewardSnapshot = await getDocs(
        collection(db, "owned_rewards")
      );
      const ownedrewards = ownedrewardSnapshot.docs.map((doc) =>
        OwnedRewards.fromFirestore(doc)
      );
      res.status(200).send(ownedrewards);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
    
     
      getById = async (req, res, next) => {
        try {
          const id = req.params.id;
          const ownedrewards = doc(db, "owned_rewards", id);
          const data = await getDoc(ownedrewards);
          const ownedrewardData = OwnedRewards.fromFirestore(data);
          if (data.exists()) {
            res.status(200).send(ownedrewardData);
          } else {
            res.status(404).send({ message: "Owned_Reward not found!" });
          }
        } catch (error) {
          res.status(400).send({ message: error.message });
        }
      };
    
        update = async (req, res, next) => {
          try {
            const id = req.params.id;
            const { studentId, rewardId, number } = req.body;
            const ref = doc(db, "owned_rewards", id);
            await updateDoc(ref, {
                studentId,
                rewardId,
                number,
              updatedAt: serverTimestamp(),
            });
            res
              .status(200)
              .send({ message: "Owned_Reward updated successfully!" });
          } catch (error) {
            res.status(400).send({ message: error.message });
          }
        };

          delete = async (req, res, next) => {
            try {
              const id = req.params.id;
              await deleteDoc(doc(db, "owned_rewards", id));
              res
                .status(200)
                .send({ message: "Owned_Reward deleted successfully!" });
            } catch (error) {
              res.status(400).send({ message: error.message });
            }
          };
   
}

module.exports = new OwnedRewardsController();
