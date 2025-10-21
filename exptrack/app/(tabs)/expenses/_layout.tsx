import { Stack } from "expo-router";

export default function ExpensesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Expenses" }} />
      <Stack.Screen name="create" options={{ title: "Create Expense" }} />
      <Stack.Screen name="update/[id]" options={{ title: "Update Expense" }} />
    </Stack>
  );
}
