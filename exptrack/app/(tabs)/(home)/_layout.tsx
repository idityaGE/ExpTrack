import { UserMenu } from "@/components/user-menu"
import { Stack } from "expo-router"

const HomeLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerRight: () => <UserMenu />,
          headerBlurEffect: 'regular',
        }}
      />
    </Stack>
  )
}

export default HomeLayout