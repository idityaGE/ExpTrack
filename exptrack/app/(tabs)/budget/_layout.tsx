import { Stack } from "expo-router"
import { UserMenu } from "@/components/user-menu"

export default function BudgetLayout() {
  return (
    <Stack
      screenOptions={{
        headerRight: () => <UserMenu />,
        headerBlurEffect: 'light',
      }}
    >
      <Stack.Screen name="index" options={{ title: "Budgets" }} />
      <Stack.Screen name="create" options={{ title: "Create Budget" }} />
      <Stack.Screen name="[id]" options={{ title: "Budget Details" }} />
      <Stack.Screen name="update/[id]" options={{ title: "Update Budget" }} />
    </Stack>
  )
}