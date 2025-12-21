import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <Stack screenOptions={{ headerShown: false }} />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
