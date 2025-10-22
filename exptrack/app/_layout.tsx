import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "./global.css"
import { AuthProvider, useAuth } from "@/store/auth-context";
import { useEffect } from "react";

const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  // app/profile/[user].tsx
  const segments = useSegments();  // segments = ["profile", "[user]"]

  useEffect(() => {
    const isAuthGroup = segments[0] === "auth";
    if (!user && !isAuthGroup && !isLoading)
      router.replace("/auth/login");
    else if (user && isAuthGroup && !isLoading)
      router.replace("/");
  }, [user, segments])

  return <>{children}</>
}


export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <RouteGuard>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
              </Stack>
            </RouteGuard>
          </SafeAreaView>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
