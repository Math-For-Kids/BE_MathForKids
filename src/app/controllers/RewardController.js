const Reward = require("../models/Reward");
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

class RewardController {

create = async (req, res, next) => {
    try {
      const { name, image, description, isDisabled } = req.body;
      const rewardData = {
        name,
        image,
        description,
        isDisabled: isDisabled ?? false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(collection(db, "reward"), rewardData);
      res
        .status(200)
        .send({ message: "Reward created successfully!" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

 
  getAll = async (req, res, next) => {
    try {
      const rewardSnapshot = await getDocs(
        collection(db, "reward")
      );
      const rewards = rewardSnapshot.docs.map((doc) =>
        Reward.fromFirestore(doc)
      );
      res.status(200).send(rewards);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
    
     
      getById = async (req, res, next) => {
        try {
          const id = req.params.id;
          const reward = doc(db, "reward", id);
          const data = await getDoc(reward);
          const rewardData = Reward.fromFirestore(data);
          if (data.exists()) {
            res.status(200).send(rewardData);
          } else {
            res.status(404).send({ message: "Reward not found!" });
          }
        } catch (error) {
          res.status(400).send({ message: error.message });
        }
      };
    
        update = async (req, res, next) => {
          try {
            const id = req.params.id;
            const { name, image, description, isDisabled} = req.body;
            const ref = doc(db, "reward", id);
            await updateDoc(ref, {
                name,
                image,
                description,
                isDisabled: isDisabled ?? false,
              updatedAt: serverTimestamp(),
            });
            res
              .status(200)
              .send({ message: "Reward updated successfully!" });
          } catch (error) {
            res.status(400).send({ message: error.message });
          }
        };

          delete = async (req, res, next) => {
            try {
              const id = req.params.id;
              await deleteDoc(doc(db, "reward", id));
              res
                .status(200)
                .send({ message: "Reward deleted successfully!" });
            } catch (error) {
              res.status(400).send({ message: error.message });
            }
          };
   
}

module.exports = new RewardController();
