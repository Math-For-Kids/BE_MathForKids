class UserNotification {
  constructor(id, userId, title, content, goalId, type, isRead, createdAt, updatedAt) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.content = content;
    this.goalId = goalId;
    this.type = type;
    this.isRead = isRead;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new UserNotification(
      doc.id,
      data.userId,
      data.title,
      data.content,
      data.goalId,
      data.type,
      data.isRead,
      data.createdAt?.toDate().toLocaleString("vi-VN"),
      data.updatedAt?.toDate().toLocaleString("vi-VN")
    );
  }
}

module.exports = UserNotification;
