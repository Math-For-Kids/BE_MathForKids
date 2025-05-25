class TestQuestion {
  constructor(
    id,
    testId,
    exerciseId,
    level,
    question,
    image,
    option,
    correctAnswer,
    selectedAnswer,
    isDisabled,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.testId = testId;
    this.exerciseId = exerciseId;
    this.level = level;
    this.question = question;
    this.image = image;
    this.option = option;
    this.correctAnswer = correctAnswer;
    this.selectedAnswer = selectedAnswer;
    this.isDisabled = isDisabled;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new TestQuestion(
      doc.id,
      data.testId ?? '',
      data.exerciseId ?? '',
      data.level ?? {},
      data.question ?? {},
      data.image ?? [],
      data.option ?? [],
      data.correctAnswer ?? '',
      data.selectedAnswer ?? '',
      data.isDisabled ?? false,
      data.createdAt?.toDate().toLocaleString('vi-VN') ?? '',
      data.updatedAt?.toDate().toLocaleString('vi-VN') ?? ''
    );
  }
}

module.exports = TestQuestion;
