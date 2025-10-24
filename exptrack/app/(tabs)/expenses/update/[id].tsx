import { View, ActivityIndicator } from 'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getExpenseById } from '@/api/expense'
import { Text } from '@/components/ui/text'
import { UpdateExpenseForm } from '@/components/expense/update-form'

const UpdateExpenseScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: expenseData, isLoading, error } = useQuery({
    queryKey: ['expenses', id],
    queryFn: () => getExpenseById(id),
  })

  const handleSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['expenses', id] })
    await queryClient.invalidateQueries({ queryKey: ['expenses', 'all'] })
    await queryClient.invalidateQueries({ queryKey: ['expenses', 'budget', expenseData?.expense.budget_id] })
    router.back()
  }

  if (isLoading) {
    return (
      <View className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size="large" />
        <Text className='text-muted-foreground mt-4'>Loading expense...</Text>
      </View>
    )
  }

  if (error || !expenseData?.expense) {
    return (
      <View className='flex-1 bg-background items-center justify-center p-6'>
        <Text className='text-destructive text-center text-lg'>
          Error loading expense
        </Text>
        <Text className='text-muted-foreground text-center mt-2'>
          {error?.message || 'Expense not found'}
        </Text>
      </View>
    )
  }

  return (
    <View className='flex-1 bg-primary-foreground'>
      <UpdateExpenseForm expense={expenseData.expense} onSuccess={handleSuccess} />
    </View>
  )
}

export default UpdateExpenseScreen