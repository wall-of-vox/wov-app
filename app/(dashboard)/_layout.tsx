import { Slot, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setToken } from "@/features/auth/authSlice";
import { getAccessToken } from "@/lib/secureStore";
import { useGetCurrentUserQuery } from "@/features/user/userApi";

export default function DashboardLayout() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const [hydrated, setHydrated] = useState(false);
  const [route, setRoute] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) {
        const t = await getAccessToken();
        if (mounted && t) dispatch(setToken(t));
      }
      if (mounted) setHydrated(true);
    })();
    return () => {
      mounted = false;
    };
  }, [token, dispatch]);

  const { data, isLoading, isError } = useGetCurrentUserQuery(undefined, {
    skip: !hydrated || !token,
  });

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setRoute("/(auth)/login");
      return;
    }
    if (isLoading) {
      setRoute(null);
      return;
    }
    if (isError) {
      setRoute("/(auth)/accountType");
      return;
    }
    if (data) {
      setRoute(null);
    } else {
      setRoute("/(auth)/accountType");
    }
  }, [hydrated, token, isLoading, isError, data]);

  if (!hydrated || isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (route) {
    return <Redirect href={route} />;
  }

  return <Slot />;
}
