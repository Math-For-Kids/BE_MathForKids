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
const { uploadMultipleFiles } = require("./fileController");
const db = getFirestore();

class RewardController {
  // Create reward
  create = async (req, res, next) => {
    try {
      const { name, description } = req.body;
      if (!req.files || req.files.length === 0) {
        return res.status(400).send({ message: "Image file is required." });
      }

      const uploadedFiles = await uploadMultipleFiles(req.files);
      const image = uploadedFiles["image"];
      const parsedName = JSON.parse(name);
      const parsedDescription = JSON.parse(description);

      const rewardRef = await addDoc(collection(db, "reward"), {
        name: parsedName,
        description: parsedDescription,
        image,
        isDisabled: false,
        createdAt: serverTimestamp(),
      });

      res.status(201).send({
        message: {
          en: "Reward created successfully!",
          vi: "Tạo phần thưởng thành công!",
        },
        id: rewardRef.id,
      });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get all rewards
  getAll = async (req, res, next) => {
    try {
      const rewardSnapshot = await getDocs(collection(db, "reward"));
      const rewards = rewardSnapshot.docs.map((doc) =>
        Reward.fromFirestore(doc)
      );
      res.status(200).send(rewards);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get enabled rewards
  getEnabledRewards = async (req, res) => {
    try {
      const rewardsRef = collection(db, "reward");
      const q = query(rewardsRef, where("isDisabled", "==", false));
      const snapshot = await getDocs(q);
      const rewards = snapshot.docs.map((doc) => Reward.fromFirestore(doc));
      res.status(200).send(rewards);
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };

  // Get reward by ID
  getById = async (req, res, next) => {
    const id = req.params.id;
    const reward = req.reward;
    res.status(200).send({ id: id, ...reward });
  };

  // Update reward
  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { isDisabled, name, description } = req.body;
      console.log("req.files:", req.files);
      const updateData = {
        updatedAt: serverTimestamp(),
      };
      const currentReward = req.reward;
      const parsedName = typeof name === "string" ? JSON.parse(name) : name;
      const parsedDescription =
        typeof description === "string" ? JSON.parse(description) : description;

      if (isDisabled !== undefined && !name && !description && !req.files) {
        updateData.isDisabled = isDisabled;
      } else {
        updateData.name = parsedName;
        updateData.description = parsedDescription;
        // Nếu có files thì xử lý upload ảnh
        if (req.files && Object.keys(req.files).length > 0) {
          const uploadedFiles = await uploadMultipleFiles(req.files);
          updateData.image = uploadedFiles.image;
        } else {
          updateData.image = currentReward.data().image;
        }
      }
      await updateDoc(ref, updateData);
      res.status(200).send({
        message: {
          en: "Reward updated successfully!",
          vi: "Cập nhật phần thưởng thành công!",
        },
      });
    } catch (error) {
      res.status(500).send({
        message: {
          en: error.message,
          vi: "Đã xảy ra lỗi nội bộ.",
        },
      });
    }
  };
}

module.exports = new RewardController();
