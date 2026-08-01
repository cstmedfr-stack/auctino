type AuthValidationMessages = {
  invalidEmail: string;
  passwordRequired: string;
  fullNameRequired: string;
  fullNameTooShort: string;
  passwordTooShort: string;
};

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );
}

export function validateLoginForm(
  email: string,
  password: string,
  messages: AuthValidationMessages
) {
  if (!isValidEmail(email)) {
    return messages.invalidEmail;
  }

  if (!password.trim()) {
    return messages.passwordRequired;
  }

  return "";
}

export function validateRegisterForm(
  fullName: string,
  email: string,
  password: string,
  messages: AuthValidationMessages
) {
  if (!fullName.trim()) {
    return messages.fullNameRequired;
  }

  if (fullName.trim().length < 3) {
    return messages.fullNameTooShort;
  }

  if (!isValidEmail(email)) {
    return messages.invalidEmail;
  }

  if (password.length < 6) {
    return messages.passwordTooShort;
  }

  return "";
}