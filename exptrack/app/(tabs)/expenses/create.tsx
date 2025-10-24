import { View } from 'react-native'
import React from 'react'
import { CreateExpenseForm } from '@/components/expense/create-form'

const CreateExpenseScreen = () => {
  return (
    <View className='flex-1 bg-primary-foreground'>
      <CreateExpenseForm onSuccess={() => { }} />
    </View>
  )
}

export default CreateExpenseScreen