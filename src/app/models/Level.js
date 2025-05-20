class Level {
  constructor(
    id, 
    name, 
    isDisabled, 
    createdAt, 
    updatedAt
  ) {
    this.id = id;
    this.name = name;
    this.isDisabled = isDisabled;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Level(
      doc.id,
      data.name ?? {},
      data.isDisabled ?? false,
      data.createdAt?.toDate().toLocaleString("vi-VN") ?? '',
      data.updatedAt?.toDate().toLocaleString("vi-VN") ?? ''
    );
  }
}

module.exports = Level;
