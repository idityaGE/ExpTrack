import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className='flex-1 justify-center items-center'>
        <Text className='text-red-500 text-2xl'>This screen doesn't exist.</Text>

        <Link href="/">
          <Button variant='default'>
            <Text className='text-blue-500'>Go to home screen!</Text>
          </Button>
        </Link>
      </View>
    </>
  );
}
