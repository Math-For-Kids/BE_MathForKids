const ExchangeReward = require("../models/ExchangeReward");
const {
    getFirestore,
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    serverTimestamp,
    query,
    where,
} = require("firebase/firestore");
const db = getFirestore();

class ExchangeRewardController {
    // Create exchange reward
    create = async (req, res, next) => {
        try {
            const { pupilId, rewardId } = req.body;
            const docRef = await addDoc(collection(db, "exchange_rewards"), {
                pupilId,
                rewardId,
                isAccept: false,
                createdAt: serverTimestamp(),
            });
            res.status(201).send({
                id: docRef.id,
                message: {
                    en: "Exchange reward created successfully!",
                    vi: "Tạo phần thưởng trao đổi thành công!",
                },
                data: {
                    pupilId,
                    rewardId,
                    isAccept: false,
                    createdAt: new Date().toISOString(),
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

    // Update exchange reward
    update = async (req, res, next) => {
        try {
            const id = req.params.id;
            const { pupilId, rewardId, isAccept } = req.body;
            const ref = doc(db, "exchange_rewards", id);
            await updateDoc(ref, {
                pupilId,
                rewardId,
                isAccept,
                updatedAt: serverTimestamp(),
            });
            res.status(200).send({
                message: {
                    en: "Exchange reward updated successfully!",
                    vi: "Cập nhật phần thưởng trao đổi thành công!",
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

    // Get exchange rewards by pupilId
    getByPupilId = async (req, res, next) => {
        try {
            const { pupilId } = req.params;
            const q = query(
                collection(db, "exchange_rewards"),
                where("pupilId", "==", pupilId)
            );
            const snapshot = await getDocs(q);
            const exchangeRewards = snapshot.docs.map((doc) =>
                ExchangeReward.fromFirestore(doc)
            );
            res.status(200).send({
                data: exchangeRewards,
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

    // Get exchange reward by ID
    getById = async (req, res, next) => {
        try {
            const id = req.params.id;
            const docRef = doc(db, "exchange_rewards", id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                return res.status(404).send({
                    message: {
                        en: "Exchange reward not found",
                        vi: "Không tìm thấy phần thưởng trao đổi",
                    },
                });
            }
            const exchangeReward = ExchangeReward.fromFirestore(docSnap);
            res.status(200).send({ id, ...exchangeReward });
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

module.exports = new ExchangeRewardController();