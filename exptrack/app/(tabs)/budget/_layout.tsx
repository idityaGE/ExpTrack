import { Stack } from "expo-router"

export default function BudgetLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Budget Overview", headerShown: false }} />
      <Stack.Screen name="create" options={{ title: "Create Budget", headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: "Budget Details", headerShown: false }} />
      <Stack.Screen name="update/[id]" options={{ title: "Update Budget", headerShown: false }} />
    </Stack>
  )
}