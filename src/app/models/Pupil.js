class Pupil {
  constructor(
    id,
    userId,
    fullName,
    nickName,
    image,
    gender,
    dateOfBirth,
    grade,
    point,
    volume,
    language,
    mode,
    theme,
    isAssess,
    createdAt,
    updatedAt
  ) {
    this.id = id; 
    this.userId = userId;
    this.fullName = fullName;
    this.nickName = nickName;
    this.image = image;
    this.gender = gender;
    this.dateOfBirth = dateOfBirth;
    this.grade = grade;
    this.point = point;
    this.volume = volume;
    this.language = language;
    this.mode = mode;
    this.theme = theme;
    this.isAssess = isAssess;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(doc) {
  const data = doc.data();
  return new Pupil(
    doc.id,
    data.fullName ?? '',
    data.nickName ?? '',
    data.image ?? '',
    data.gender ?? '',
    data.dateOfBirth?.toDate().toLocaleDateString("vi-VN") ?? '',
    data.grade ?? '',
    data.point ?? 0,
    data.volume ?? 0,
    data.language ?? '',
    data.mode ?? false,
    data.theme ?? '',
    data.isAssess ?? false,
    data.createdAt?.toDate().toLocaleString("vi-VN") ?? '',
    data.updatedAt?.toDate().toLocaleString("vi-VN") ?? ''
  );
}

}

module.exports = Pupil;
