import { Stack } from "expo-router";
import { UserMenu } from "@/components/user-menu";
import { Drawer } from 'expo-router/drawer';

export default function ExpensesLayout() {
  return (
    <Stack
      screenOptions={{
        headerRight: () => <UserMenu />,
        headerBlurEffect: 'prominent',
      }}
    >
      <Stack.Screen name="index" options={{ title: "Expenses" }} />
      <Stack.Screen name="create" options={{ title: "Create Expense" }} />
      <Stack.Screen name="update/[id]" options={{ title: "Update Expense" }} />
    </Stack>
  );
}