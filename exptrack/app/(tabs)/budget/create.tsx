import { View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { CreateBudgetForm } from '@/components/budget/create-form'
import { useQueryClient } from '@tanstack/react-query'

const CreateBudget = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['budgets', 'all'] })
    router.back()
  }

  return (
    <View className='flex-1 bg-primary-foreground'>
      <CreateBudgetForm onSuccess={handleSuccess} />
    </View>
  )
}

export default CreateBudget