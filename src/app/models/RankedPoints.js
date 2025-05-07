class RankedPoints {
    constructor(id, studentId, lessonId, point, time_completed, createAt, updateAt) {
        (this.id = id),
            (this.studentId = studentId),
            (this.lessonId = lessonId),
            (this.point = point),
            (this.time_completed = time_completed),
            (this.createAt = createAt),
            (this.updateAt = updateAt);
    }
    static fromFirestore(doc) {
        const data = doc.data();
        return new RankedPoints(
            doc.id,
            data.studentId,
            data.lessonId,
            data.point,
            data.time_completed,
            data.createAt?.toDate().toLocaleString("vi-VN"),
            data.updateAt?.toDate().toLocaleString("vi-VN")
        );
    }
}
module.exports = RankedPoints;