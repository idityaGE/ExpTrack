import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import type { TriggerRef } from '@rn-primitives/popover';
import { LogOutIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/store/auth-context';
import { useRouter } from 'expo-router';

const AVATAR_IMAGE = { uri: 'https://github.com/mrzachnugent.png' };

export function UserMenu() {
  const { logout, user } = useAuth();
  const popoverTriggerRef = React.useRef<TriggerRef>(null);
  const router = useRouter();

  async function onSignOut() {
    popoverTriggerRef.current?.close();
    await logout();
    router.replace('/auth/login');
  }

  if (!user) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild ref={popoverTriggerRef}>
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <Avatar alt={`${user.name}'s avatar`} className="size-8">
            <AvatarImage source={AVATAR_IMAGE} />
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" className="w-72 p-0">
        <View className="border-border gap-3 border-b p-3">
          <View className="flex-row items-center gap-3">
            <Avatar alt={`${user.name}'s avatar`} className="size-10">
              <AvatarImage source={AVATAR_IMAGE} />
            </Avatar>
            <View className="flex-1">
              <Text className="font-medium leading-5">{user.name}</Text>
              <Text className="text-muted-foreground text-sm font-normal leading-4">
                {user.email}
              </Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-3 py-0.5">
            <ThemeToggle />
            <Button variant="destructive" size="sm" className="flex-1" onPress={onSignOut}>
              <Icon as={LogOutIcon} className="size-4 text-white" />
              <Text>Sign Out</Text>
            </Button>
          </View>
        </View>
      </PopoverContent>
    </Popover>
  );
}