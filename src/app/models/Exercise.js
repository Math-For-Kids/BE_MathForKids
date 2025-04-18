class Exercise {
    constructor(id, lessonId, name, createdAt, updatedAt) {
      (this.id = id),
        (this.lessonId = lessonId),
        (this.name = name),
        (this.createdAt = createdAt),
        (this.updatedAt = updatedAt);
    }

    static fromFirestore(doc) {
      const data = doc.data();
      return new Exercise(
        doc.id,
        data.lessonId,
        data.name,
        data.createdAt?.toDate().toLocaleString("vi-VN"),
        data.updatedAt?.toDate().toLocaleString("vi-VN")
      );
    }
  }
  
  module.exports = Exercise;