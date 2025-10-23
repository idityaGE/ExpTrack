import { UserMenu } from "@/components/user-menu"
import { Stack } from "expo-router"

const HomeLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        options={{
          title: 'Home',
          headerRight: () => <UserMenu />,
          headerBlurEffect: 'light',
        }}
      />
    </Stack>
  )
}

export default HomeLayout