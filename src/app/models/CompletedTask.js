class CompleteTask {
  constructor(id, studentId, taskId, isCompleted, createdAt, updatedAt) {
    this.id = id;
    this.studentId = studentId;
    this.taskId = taskId;
    this.isCompleted = isCompleted;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new CompleteTask(
      doc.id,
      data.studentId,
      data.taskId,
      data.isCompleted,
      data.createdAt?.toDate().toLocaleString("vi-VN"),
      data.updatedAt?.toDate().toLocaleString("vi-VN")
    );
  }
}

module.exports = CompleteTask;
