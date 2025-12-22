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
    env('NEXT_PUBLIC_USER_BASE_URL', 'https://api.wallofvox.com/user'),
  FOLLOW_BASE_URL:
    env('EXPO_PUBLIC_FOLLOW_BASE_URL') ??
    env('NEXT_PUBLIC_FOLLOW_BASE_URL', 'https://api.wallofvox.com/follow'),
  REVIEW_BASE_URL:
    env('EXPO_PUBLIC_REVIEW_BASE_URL') ??
    env('NEXT_PUBLIC_REVIEW_BASE_URL', 'https://api.wallofvox.com/review'),
  REALTIME_BASE_URL:
    env('EXPO_PUBLIC_REALTIME_BASE_URL') ??
    env('NEXT_PUBLIC_REALTIME_BASE_URL', 'https://api.wallofvox.com/realtime'),
} as const;

export const GOOGLE_OAUTH = {
  ACCESS_TOKEN:
    env('EXPO_PUBLIC_GOOGLE_CLIENT_ID') ??
    env('NEXT_PUBLIC_GOOGLE_CLIENT_ID', '250605790747-b8f43ia9k0iepvo7ebnv9r1oou6a50j0.apps.googleusercontent.com'),
  ANDROID_CLIENT_ID:
    env('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID') ??
    env('NEXT_PUBLIC_GOOGLE_ANDROID_CLIENT_ID', '934535478656-g9fne9318g4rd927s2ek3hv814p6874j.apps.googleusercontent.com'),
  IOS_CLIENT_ID:
    env('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID') ??
    env('NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID', '934535478656-393642212212.apps.googleusercontent.com'),
} as const;
