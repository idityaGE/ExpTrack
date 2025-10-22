import { View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';

const RegisterScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View>
        <Text>RegisterScreen</Text>
      </View>
    </SafeAreaView>
  )
}

export default RegisterScreen