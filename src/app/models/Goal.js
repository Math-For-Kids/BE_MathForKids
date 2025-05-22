class Goal {
    constructor(id, pupilId, dateStart, dateEnd, type, lessonId, exerciseId, rewardId, isCompleted, createdAt, updatedAt) {
      (this.id = id),
        (this.pupilId = pupilId),
        (this.dateStart = dateStart),
        (this.dateEnd = dateEnd),
        (this.type = type),
        (this.lessonId = lessonId),
        (this.exerciseId = exerciseId),
        (this.rewardId = rewardId),
        (this.isCompleted = isCompleted),
        (this.createdAt = createdAt),
        (this.updatedAt = updatedAt);
    }

    static fromFirestore(doc) {
      const data = doc.data();
      return new Goal(
        doc.id,
        data.pupilId, 
        data.dateStart,
        data.dateEnd,
        data.type,
        data.lessonId,
        data.exerciseId,
        data.rewardId,
        data.isCompleted,
        data.createdAt?.toDate().toLocaleString("vi-VN"),
        data.updatedAt?.toDate().toLocaleString("vi-VN")
      );
    }
  }
  
  module.exports = Goal;