class Tests {
  constructor(
    id,
    lessonId,
    exerciseId,
    level,
    question,
    image,
    option,
    answer,
    time,
    isDisabled,
    createdAt
  ) {
    this.id = id;
    this.lessonId = lessonId;
    this.exerciseId = exerciseId;
    this.level = level;
    this.question = question;
    this.image = image;
    this.option = option;
    this.answer = answer;
    this.time = time;
    this.isDisabled = isDisabled;
    this.createdAt = createdAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Tests(
      doc.id,
      data.lessonId ?? '',
      data.exerciseId ?? '',
      data.level ?? {},
      data.question ?? {},
      data.image ?? [],
      data.option ?? [],
      data.answer ?? '',
      data.time ?? 0,
      data.isDisabled ?? false,
      data.createdAt?.toDate().toLocaleString("vi-VN") ?? ''
    );
  }
}

module.exports = Tests;
