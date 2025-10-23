import { Text } from '@/components/ui/text'
import React, { useEffect } from 'react'
import { getAllExpense } from '@/api/expense'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'

const ExpensesScreen = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', 'all'],
    queryFn: getAllExpense,
  })

  return (
    <SafeAreaView className='flex-1'>
      <Text>
        Expenses Screen - {isLoading ? 'Loading...' : JSON.stringify(data)}
      </Text>
    </SafeAreaView>
  )
}

export default ExpensesScreen