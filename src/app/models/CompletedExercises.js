class CompletedExercises {
    constructor(id, studentId, exerciseId, point, isCompleted, createAt, updateAt) {
        (this.id = id),
            (this.studentId = studentId),
            (this.exerciseId = exerciseId),
            (this.point = point),
            (this.isCompleted = isCompleted),
            (this.createAt = createAt),
            (this.updateAt = updateAt);
    }
    static fromFirestore(doc) {
        const data = doc.data();
        return new CompletedExercises(
            doc.id,
            data.studentId,
            data.lessonId,
            data.point,
            data.isCompleted,
            data.createAt?.toDate().toLocaleString("vi-VN"),
            data.updateAt?.toDate().toLocaleString("vi-VN")
        );
    }
}
module.exports = CompletedExercises;