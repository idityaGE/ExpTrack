import { ScrollView, View } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text';
import { SignUpForm } from '@/components/sign-up-form';

const RegisterScreen = () => {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="mt-safe mx-w-md px-6 pb-12 flex-1 justify-center"
      keyboardDismissMode="interactive"
    >
      <View>
        <SignUpForm />
      </View>
    </ScrollView>
  )
}

export default RegisterScreen