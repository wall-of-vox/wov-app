import * as SecureStore from "expo-secure-store";

type ExpirableValue = {
  value: string;
  expiresAt: number | null;
};

const ACCESS_KEY = "AUTH_ACCESS_TOKEN";
const REFRESH_KEY = "AUTH_REFRESH_TOKEN";

function now(): number {
  return Date.now();
}

function parseExpiresAt(expiresIn?: number | string): number | null {
  if (expiresIn === undefined || expiresIn === null) return now() + 60 * 60 * 1000;
  if (typeof expiresIn === "number") return now() + expiresIn * 1000;
  const s = String(expiresIn).trim().toLowerCase();
  if (s.endsWith("ms")) {
    const n = Number(s.slice(0, -2));
    return Number.isFinite(n) ? now() + n : now() + 60 * 60 * 1000;
  }
  const n = Number(s);
  return Number.isFinite(n) ? now() + n * 1000 : now() + 60 * 60 * 1000;
}

async function setItemWithExpiry(key: string, value: string, expiresAt: number | null) {
  const payload: ExpirableValue = { value, expiresAt };
  await SecureStore.setItemAsync(key, JSON.stringify(payload));
}

async function getItemWithExpiry(key: string): Promise<string | null> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ExpirableValue;
    if (parsed.expiresAt && parsed.expiresAt <= now()) {
      await SecureStore.deleteItemAsync(key);
      return null;
    }
    return parsed.value || null;
  } catch {
    return null;
  }
}

async function deleteItem(key: string) {
  await SecureStore.deleteItemAsync(key);
}

export async function saveAuthSession(args: { accessToken: string; refreshToken?: string | null; expiresIn?: number | string }) {
  const { accessToken, refreshToken, expiresIn } = args;
  const expiresAt = parseExpiresAt(expiresIn);
  await setItemWithExpiry(ACCESS_KEY, accessToken, expiresAt);
  if (refreshToken) {
    await setItemWithExpiry(REFRESH_KEY, refreshToken, expiresAt);
  }
}

export async function getAccessToken(): Promise<string | null> {
  return getItemWithExpiry(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItemWithExpiry(REFRESH_KEY);
}

export async function clearAuthSession() {
  await Promise.all([deleteItem(ACCESS_KEY), deleteItem(REFRESH_KEY)]);
}

