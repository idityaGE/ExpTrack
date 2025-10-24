import { View, ActivityIndicator } from 'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getBudgetById } from '@/api/budget'
import { Text } from '@/components/ui/text'
import { UpdateBudgetForm } from '@/components/budget/update-form'

const UpdateBudgetDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: budgetData, isLoading, error } = useQuery({
    queryKey: ['budgets', id],
    queryFn: () => getBudgetById(id),
  })

  const handleSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['budgets', id] })
    await queryClient.invalidateQueries({ queryKey: ['budgets', 'all'] })
    router.back()
  }

  if (isLoading) {
    return (
      <View className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size="large" />
        <Text className='text-muted-foreground mt-4'>Loading budget...</Text>
      </View>
    )
  }

  if (error || !budgetData?.budget) {
    return (
      <View className='flex-1 bg-background items-center justify-center p-6'>
        <Text className='text-destructive text-center text-lg'>
          Error loading budget
        </Text>
        <Text className='text-muted-foreground text-center mt-2'>
          {error?.message || 'Budget not found'}
        </Text>
      </View>
    )
  }

  return (
    <View className='flex-1 bg-primary-foreground'>
      <UpdateBudgetForm budget={budgetData.budget} onSuccess={handleSuccess} />
    </View>
  )
}

export default UpdateBudgetDetails