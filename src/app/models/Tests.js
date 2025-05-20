class Tests {
  constructor(
    id,
    lessonId,
    exerciseId,
    levelId,
    point,
    duration,
    createdAt,
    updateAt,
  ) {
    this.id = id;
    this.lessonId = lessonId;
    this.exerciseId = exerciseId;
    this.levelId = levelId;
    this.point = point;
    this.duration = duration;
    this.createdAt = createdAt;
    this.updateAt = updateAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Tests(
      doc.id,
      data.lessonId ?? '',
      data.exerciseId ?? '',
      data.levelId ?? '',
      data.point ?? {},
      data.duration ?? {},
      data.createdAt?.toDate().toLocaleString("vi-VN") ?? '',
      data.updateAt?.toDate().toLocaleString("vi-VN") ?? ''
    );
  }
}

module.exports = Tests;
