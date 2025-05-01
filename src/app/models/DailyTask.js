class DailyTask {
  constructor(
    id,
    title,
    description,
    lessonId,
    exerciseId,
    rewardId,
    numberReward,
    isDisabled,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.lessonId = lessonId;
    this.exerciseId = exerciseId;
    this.rewardId = rewardId;
    this.numberReward = numberReward;
    this.isDisabled = isDisabled;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new DailyTask(
      doc.id,
      data.title,
      data.description,
      data.lessonId,
      data.exerciseId,
      data.rewardId,
      data.numberReward,
      data.isDisabled,
      data.createdAt?.toDate().toLocaleString("vi-VN"),
      data.updatedAt?.toDate().toLocaleString("vi-VN")
    );
  }
}

module.exports = DailyTask;
