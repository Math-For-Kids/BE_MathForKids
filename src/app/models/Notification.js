class Notification {
  constructor(id, userId, title, content, isRead, createdAt) {
    this.id = id;
    this.userId = userId;
    this.title = title;       
    this.content = content;   
    this.isRead = isRead;
    this.createdAt = createdAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Notification(
      doc.id,
      data.userId ?? '',
      data.title ?? {},               
      data.content ?? {},             
      data.isRead ?? false,         
      data.createdAt?.toDate().toLocaleString("vi-VN") || ''
    );
  }
}

module.exports = Notification;
