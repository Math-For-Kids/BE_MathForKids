class Tests {
    constructor(id, lessonId, exerciseId, level, question, image, option, answer, time, isDisabled, createAt, updateAt) {
        (this.id = id),
            (this.lessonId = lessonId),
            (this.exerciseId = exerciseId),
            (this.level = level),
            (this.question = question),
            (this.image = image),
            (this.option = option),
            (this.answer = answer), 
            (this.time = time),
            (this.isDisabled = isDisabled),
            (this.createAt = createAt),
            (this.updateAt = updateAt);
    }
    static fromFirestore(doc) {
        const data = doc.data();
        return new RankedPoints(
            doc.id,
            data.lessonId,
            data.exerciseId,
            data.level,
            data.question,
            data.image,
            data.option,
            data.answer,
            data.time,
            data.isDisabled,
            data.createAt?.toDate().toLocaleString("vi-VN"),
            data.updateAt?.toDate().toLocaleString("vi-VN")
        );
    }
}
module.exports = Tests;