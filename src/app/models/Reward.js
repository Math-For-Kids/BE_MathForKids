class Reward {
    constructor(id, name, image, description, isDisabled, createdAt, updatedAt) {
      (this.id = id),
        (this.name = name),
        (this.image = image),
        (this.description = description),
        (this.isDisabled = isDisabled),
        (this.createdAt = createdAt),
        (this.updatedAt = updatedAt);
    }

    static fromFirestore(doc) {
      const data = doc.data();
      return new Reward(
        doc.id,
        data.name, 
        data.image,
        data.description,
        data.isDisabled,
        data.createdAt?.toDate().toLocaleString("vi-VN"),
        data.updatedAt?.toDate().toLocaleString("vi-VN")
      );
    }
  }
  
  module.exports = Reward;