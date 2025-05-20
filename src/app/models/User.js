class User {
  constructor(
    id,
    fullName,
    phoneNumber,
    email,
    gender,
    dateOfBirth,
    address,
    role,
    isVerify,
    otpCode,
    otpExpiration,
    volume,
    language,
    mode,
    isDisabled,
    createdAt,
    updatedAt
  ) {
    (this.id = id),
      (this.fullName = fullName),
      (this.phoneNumber = phoneNumber),
      (this.email = email),
      (this.gender = gender),
      (this.dateOfBirth = dateOfBirth),
      (this.address = address),
      (this.role = role),
      (this.isVerify = isVerify),
      (this.otpCode = otpCode),
      (this.otpExpiration = otpExpiration),
      (this.volume = volume),
      (this.language = language),
      (this.mode = mode),
      (this.isDisabled = isDisabled),
      (this.createdAt = createdAt),
      (this.updatedAt = updatedAt);
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new User(
      doc.id,
      data.fullName,
      data.phoneNumber,
      data.email,
      data.gender,
      data.dateOfBirth,
      data.address,
      data.role,
      data.isVerify,
      data.otpCode,
      data.otpExpiration,
      data.volume,
      data.language,
      data.mode,
      data.isDisabled,
      data.createdAt?.toDate().toLocaleString("vi-VN"),
      data.updatedAt?.toDate().toLocaleString("vi-VN")
    );
  }
}

module.exports = User;
