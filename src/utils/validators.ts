export const MIN_PASSWORD_LENGTH = 8;
export const NAME_MAX_LENGTH = 60;
export const DESCRIPTION_MAX_LENGTH = 180;
export const PHONE_REGEX = /^[0-9]{8,15}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
