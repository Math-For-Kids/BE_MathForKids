class Lesson {
  constructor(id, name, grade, createdAt, updatedAt) {
    (this.id = id),
      (this.name = name),
      (this.grade = grade),
      (this.createdAt = createdAt),
      (this.updatedAt = updatedAt);
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Lesson(
      doc.id,
      data.name,
      data.grade,
      data.createdAt?.toDate().toLocaleString("vi-VN"),
      data.updatedAt?.toDate().toLocaleString("vi-VN")
    );
  }
}

module.exports = Lesson;
