class LessonDetail {
  constructor(
    id,
    lessonId,
    order,
    title,
    content,
    number1,
    number2,
    operator,
    remember,
    answer,
    solution1,
    solution2,
    isDisabled,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.lessonId = lessonId;
    this.order = order;
    this.title = title;
    this.content = content;
    this.number1 = number1;
    this.number2 = number2;
    this.operator = operator;
    this.remember = remember;
    this.answer = answer;
    this.solution1 = solution1;
    this.solution2 = solution2;
    this.isDisabled = isDisabled;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new LessonDetail(
      doc.id,
      data.lessonId,
      data.order,
      data.title,
      data.content,
      data.number1,
      data.number2,
      data.operator,
      data.remember,
      data.answer,
      data.solution1,
      data.solution2,
      data.isDisabled,
      data.createdAt?.toDate().toLocaleString("vi-VN"),
      data.updatedAt?.toDate().toLocaleString("vi-VN")
    );
  }
}

module.exports = LessonDetail;
