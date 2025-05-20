class Assessment {
  constructor(
    id,
    grade,
    type,
    level,
    question,
    image,
    option,
    answer,
    isDisabled,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.grade = grade;
    this.type = type;
    this.level = level;
    this.question = question;
    this.image = image;
    this.option = option;
    this.answer = answer;
    this.isDisabled = isDisabled;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Assessment(
      doc.id,
      data.grade ?? 0,
      data.type ?? '',
      data.level ?? {}, 
      data.question ?? {}, 
      data.image ?? [], 
      data.option ?? [], 
      data.answer ?? '', 
      data.isDisabled ?? false, 
      data.createdAt?.toDate().toLocaleString("vi-VN") ?? '',
      data.updatedAt?.toDate().toLocaleString("vi-VN") ?? ''
    );
  }
}

module.exports = Assessment;
