import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/store/auth-context';
import { Link } from 'expo-router';
import { StarIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { user, logout } = useAuth()

  return (
    <>
      <View className="flex-1 items-center justify-center gap-8 p-4">
        <Image source={require('@/assets/images/icon.png')} style={IMAGE_STYLE} resizeMode="contain" />
        <View className="gap-2 p-4">
          <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
            Welcome {user ? user.name : 'to the App'}!
          </Text>
          <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
            {user ? user.email : "Please Login"}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Link href="/auth/login" asChild>
            <Button>
              <Text>Login</Text>
            </Button>
          </Link>
          <Link href="/auth/register" asChild>
            <Button variant="ghost">
              <Text>Register</Text>
              <Icon as={StarIcon} />
            </Button>
          </Link>

          {user && (
            <Button variant="destructive" onPress={async () => await logout()}>
              <Text>Logout</Text>
            </Button>
          )}
        </View>
      </View>
    </>
  );
}
