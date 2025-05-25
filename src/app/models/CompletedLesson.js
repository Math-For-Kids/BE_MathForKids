class CompletedLesson {
    constructor(id, pupilId, lessonId, point, isCompleted, createAt, updateAt) {
        (this.id = id),
            (this.pupilId = pupilId),
            (this.lessonId = lessonId),
            (this.point = point),
            (this.isCompleted = isCompleted),
            (this.createAt = createAt),
            (this.updateAt = updateAt);
    }
    static fromFirestore(doc) {
        const data = doc.data();
        return new CompletedLesson(
            doc.id,
            data.pupilId,
            data.lessonId,
            data.point,
            data.isCompleted,
            data.createAt?.toDate().toLocaleString("vi-VN"),
            data.updateAt?.toDate().toLocaleString("vi-VN")
        );
    }
}
module.exports = CompletedLesson;