class Exercise {
    constructor(id, lessonId, question, option, answer, createdAt, updatedAt) {
      (this.id = id),
        (this.lessonId = lessonId),
        (this.question = question),
        (this.option = option),
        (this.answer = answer),
        (this.createdAt = createdAt),
        (this.updatedAt = updatedAt);
    }

    static fromFirestore(doc) {
      const data = doc.data();
      return new Exercise(
        doc.id,
        data.lessonId,
        data.question,
        data.option,
        data.answer,
        data.createdAt?.toDate().toLocaleString("vi-VN"),
        data.updatedAt?.toDate().toLocaleString("vi-VN")
      );
    }
  }
  
  module.exports = Exercise;