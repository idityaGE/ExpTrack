import { ScrollView, View } from 'react-native'
import React from 'react'
import { SignInForm } from '@/components/sign-in-form';

const LoginScreen = () => {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="mt-safe mx-w-md px-6 pb-12 flex-1 justify-center"
      keyboardDismissMode="interactive"
    >
      <View>
        <SignInForm />
      </View>
    </ScrollView>
  )
}

export default LoginScreen