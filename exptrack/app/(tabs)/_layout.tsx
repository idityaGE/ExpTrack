import { Tabs } from "expo-router"

export default function TabLayout() {
  return <Tabs>
    <Tabs.Screen name="index" options={{ title: "Home", headerShown: false }} />
    <Tabs.Screen name="expenses" options={{ title: "Expenses", headerShown: false }} />
    <Tabs.Screen name="budget" options={{ title: "Budget", headerShown: false }} />
  </Tabs>
}