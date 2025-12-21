const env = (key: string, fallback?: string) => {
  return process.env[key] ?? fallback;
};

export const API_CONFIG = {
  AUTH_BASE_URL:
    env('EXPO_PUBLIC_AUTH_BASE_URL') ??
    env('NEXT_PUBLIC_AUTH_BASE_URL', 'https://api.wallofvox.com/auth'),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

export const SERVICES = {
  USER_BASE_URL:
    env('EXPO_PUBLIC_USER_BASE_URL') ??
    env('NEXT_PUBLIC_USER_BASE_URL', 'http://localhost:3002'),
  FOLLOW_BASE_URL:
    env('EXPO_PUBLIC_FOLLOW_BASE_URL') ??
    env('NEXT_PUBLIC_FOLLOW_BASE_URL', 'http://localhost:3003'),
  REVIEW_BASE_URL:
    env('EXPO_PUBLIC_REVIEW_BASE_URL') ??
    env('NEXT_PUBLIC_REVIEW_BASE_URL', 'http://localhost:3004'),
  REALTIME_BASE_URL:
    env('EXPO_PUBLIC_REALTIME_BASE_URL') ??
    env('NEXT_PUBLIC_REALTIME_BASE_URL', 'http://localhost:3005'),
} as const;
