import { View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { CreateExpenseForm } from '@/components/expense/create-form'
import { useQueryClient } from '@tanstack/react-query'

const CreateExpenseScreen = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['expenses', 'all'] })
    router.back()
  }

  return (
    <View className='flex-1 bg-primary-foreground'>
      <CreateExpenseForm onSuccess={handleSuccess} />
    </View>
  )
}

export default CreateExpenseScreen