class OwnedRewards {
    constructor(id, studentId  , rewardId, number, createdAt, updatedAt) {
      (this.id = id),
        (this.studentId = studentId),
        (this.rewardId = rewardId),
        (this.number = number),
        (this.createdAt = createdAt),
        (this.updatedAt = updatedAt);
    }

    static fromFirestore(doc) {
      const data = doc.data();
      return new OwnedRewards(
        doc.id,
        data.studentId , 
        data.rewardId,
        data.number, 
        data.createdAt?.toDate().toLocaleString("vi-VN"),
        data.updatedAt?.toDate().toLocaleString("vi-VN")
      );
    }
  }
  
  module.exports = OwnedRewards;