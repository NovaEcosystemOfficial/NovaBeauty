export function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function buildPhoneUrl(phone: string) {
  const digits = normalizePhoneDigits(phone);
  return digits ? `tel:${digits}` : null;
}

export function buildWhatsAppUrl(phone: string) {
  const digits = normalizePhoneDigits(phone);
  if (!digits) {
    return null;
  }

  const normalized = digits.startsWith("39") ? digits : `39${digits.replace(/^0+/, "")}`;
  return `https://wa.me/${normalized}`;
}

export function buildEmailUrl(email: string) {
  const trimmed = email.trim();
  return trimmed ? `mailto:${trimmed}` : null;
}

export function buildExternalUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
