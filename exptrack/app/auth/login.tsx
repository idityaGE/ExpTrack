import { View } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View>
        <Text>LoginScreen</Text>
      </View>
    </SafeAreaView>
  )
}

export default LoginScreen