class Test {
  constructor(
    id,
    pupilId,
    lessonId,
    levelId,
    point,
    duration,
    createdAt,
    updateAt
  ) {
    this.id = id;
    this.pupilId = pupilId;
    this.lessonId = lessonId;
    this.levelId = levelId;
    this.point = point;
    this.duration = duration;
    this.createdAt = createdAt;
    this.updateAt = updateAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Test(
      doc.id,
      data.pupilId ?? '',
      data.lessonId ?? '',
      data.levelId ?? '',
      data.point ?? 0,
      data.duration ?? 0,
      data.createdAt?.toDate().toLocaleString("vi-VN") ?? '',
      data.updatedAt?.toDate().toLocaleString('vi-VN') ?? ''
    );
  }
}

module.exports = Test;
