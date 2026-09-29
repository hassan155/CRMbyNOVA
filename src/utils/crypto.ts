// Simple lightweight encoder/decoder for simulated safe client storage
export function encodeData(data: unknown): string {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch {
    return JSON.stringify(data);
  }
}

export function decodeData<T>(encoded: string): T | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    try {
      return JSON.parse(encoded);
    } catch {
      return null;
    }
  }
}

export function hashPassword(plain: string): string {
  let hash = 0;
  for (let i = 0; i < plain.length; i++) {
    const char = plain.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}_${btoa(plain).slice(0, 8)}`;
}

export function verifyPassword(plain: string, hash: string): boolean {
  return hashPassword(plain) === hash || hash === plain || hash === `hash_${plain}`;
}
