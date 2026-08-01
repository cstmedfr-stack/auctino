type ProfileValidationMessages = {
  fullNameTooLong: string;
  phoneTooLong: string;
  cityTooLong: string;
  avatarUrlTooLong: string;
};

export function validateEditableProfile(
  fullName: string,
  phone: string,
  city: string,
  avatarUrl: string,
  messages: ProfileValidationMessages
) {
  if (fullName.trim().length > 100) {
    return messages.fullNameTooLong;
  }

  if (phone.trim().length > 30) {
    return messages.phoneTooLong;
  }

  if (city.trim().length > 100) {
    return messages.cityTooLong;
  }

  if (avatarUrl.trim().length > 2000) {
    return messages.avatarUrlTooLong;
  }

  return "";
}