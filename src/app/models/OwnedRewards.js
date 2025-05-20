class OwnedRewards {
    constructor(id, pupilId  , rewardId, number, createdAt, updatedAt) {
      (this.id = id),
        (this.pupilId = pupilId),
        (this.rewardId = rewardId),
        (this.number = number),
        (this.createdAt = createdAt),
        (this.updatedAt = updatedAt);
    }

    static fromFirestore(doc) {
      const data = doc.data();
      return new OwnedRewards(
        doc.id,
        data.pupilId , 
        data.rewardId,
        data.number, 
        data.createdAt?.toDate().toLocaleString("vi-VN"),
        data.updatedAt?.toDate().toLocaleString("vi-VN")
      );
    }
  }
  
  module.exports = OwnedRewards;