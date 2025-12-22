import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GOOGLE_OAUTH } from "./constants";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleOAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_OAUTH.ACCESS_TOKEN,
    androidClientId: GOOGLE_OAUTH.ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_OAUTH.IOS_CLIENT_ID,
    scopes: ["profile", "email"],
  });

  const getAccessToken = async (): Promise<string | null> => {
    const result = await promptAsync();
    if (result.type === "success") {
      return result.authentication?.accessToken ?? null;
    }
    return null;
  };

  return { request, getAccessToken };
}

