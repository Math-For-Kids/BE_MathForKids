class Question {
    constructor(id, exerciseId, question, option, answer, createdAt, updatedAt) {
      (this.id = id),
        (this.exerciseId = exerciseId),
        (this.question = question),
        (this.option = option),
        (this.answer = answer),
        (this.createdAt = createdAt),
        (this.updatedAt = updatedAt);
    }

    static fromFirestore(doc) {
      const data = doc.data();
      return new Question(
        doc.id,
        data.exerciseId,
        data.question,
        data.option,
        data.answer,
        data.createdAt?.toDate().toLocaleString("vi-VN"),
        data.updatedAt?.toDate().toLocaleString("vi-VN")
      );
    }
  }
  
  module.exports = Question;