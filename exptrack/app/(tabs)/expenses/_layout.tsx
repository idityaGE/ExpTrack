import { Stack } from "expo-router";

export default function ExpensesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: "Expenses" }} />
      <Stack.Screen name="create" options={{ headerShown: false, title: "Create Expense" }} />
      <Stack.Screen name="update/[id]" options={{ headerShown: false, title: "Update Expense" }} />
    </Stack>
  );
}
