class Lesson {
  constructor(id, name, grade, type, createdAt, updatedAt) {
    (this.id = id),
      (this.name = name),
      (this.grade = grade),
      (this.type = type),
      (this.createdAt = createdAt),
      (this.updatedAt = updatedAt);
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Lesson(
      doc.id,
      data.name,
      data.grade,
      data.type,
      data.createdAt?.toDate().toLocaleString("vi-VN"),
      data.updatedAt?.toDate().toLocaleString("vi-VN")
    );
  }
}

module.exports = Lesson;
