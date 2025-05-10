class Goal {
    constructor(id, studentID, dateStart, dateEnd, type, lessonId,exerciseId,rewardId, createdAt, updatedAt) {
      (this.id = id),
        (this.studentID = studentID),
        (this.dateStart = dateStart),
        (this.dateEnd = dateEnd),
        (this.type = type),
        (this.lessonId = lessonId),
        (this.exerciseId = exerciseId),
        (this.rewardId = rewardId),
        (this.createdAt = createdAt),
        (this.updatedAt = updatedAt);
    }

    static fromFirestore(doc) {
      const data = doc.data();
      return new Goal(
        doc.id,
        data.studentID, 
        data.dateStart,
        data.dateEnd,
        data.type,
        data.lessonId,
        data.exerciseId,
        data.rewardId,
        data.createdAt?.toDate().toLocaleString("vi-VN"),
        data.updatedAt?.toDate().toLocaleString("vi-VN")
      );
    }
  }
  
  module.exports = Goal;