class RankedPoints {
    constructor(id, pupilId, lessonId, point, time_completed, createAt, updateAt) {
        (this.id = id),
            (this.pupilId = pupilId),
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
            data.pupilId,
            data.lessonId,
            data.point,
            data.time_completed,
            data.createAt?.toDate().toLocaleString("vi-VN"),
            data.updateAt?.toDate().toLocaleString("vi-VN")
        );
    }
}
module.exports = RankedPoints;