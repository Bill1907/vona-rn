import { ThemeWrapper } from "@/components/common/ThemeWrapper";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <ThemeWrapper>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" />
      </Stack>
    </ThemeWrapper>
  );
}
