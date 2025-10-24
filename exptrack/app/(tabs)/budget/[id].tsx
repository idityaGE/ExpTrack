import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { getExpensesByBudgetId } from '@/api/expense'
import { getBudgetById } from '@/api/budget'
import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { ExpenseCard } from '@/components/expense/expense-card'
import { BudgetCard } from '@/components/budget/budget-card'
import { Expense } from '@/schema/expense'
import { useMemo } from 'react'
import { Icon } from '@/components/ui/icon'
import { PencilIcon } from 'lucide-react-native'

const BudgetDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { data: budgetData, isLoading: budgetLoading, error: budgetError } = useQuery({
    queryKey: ['budgets', id],
    queryFn: () => getBudgetById(id),
  })

  const { data: expensesData, isLoading: expensesLoading, error: expensesError } = useQuery({
    queryKey: ['expenses', 'budget', id],
    queryFn: () => getExpensesByBudgetId(id),
  })

  const totalSpent = useMemo(() => {
    if (!expensesData?.expenses) return 0
    return expensesData.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [expensesData])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (budgetLoading || expensesLoading) {
    return (
      <View className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size="large" />
        <Text className='text-muted-foreground mt-4'>Loading budget details...</Text>
      </View>
    )
  }

  if (budgetError || expensesError) {
    return (
      <View className='flex-1 bg-background items-center justify-center p-6'>
        <Text className='text-destructive text-center text-lg'>
          Error loading budget details
        </Text>
        <Text className='text-muted-foreground text-center mt-2'>
          {(budgetError || expensesError)?.message || 'Please try again'}
        </Text>
      </View>
    )
  }

  if (!budgetData?.budget) {
    return (
      <View className='flex-1 bg-background items-center justify-center p-6'>
        <Text className='text-muted-foreground text-center text-lg'>
          Budget not found
        </Text>
      </View>
    )
  }

  const budget = budgetData.budget

  return (
    <View className='flex-1 bg-background'>
      {/* Edit Button */}
      <Pressable
        onPress={() => router.push(`/budget/update/${id}`)}
        className='absolute right-8 bottom-28 bg-primary rounded-full w-14 h-14 z-10 items-center justify-center shadow-lg active:opacity-80'
        style={{
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
        }}
      >
        <Icon as={PencilIcon} size={24} className='text-primary-foreground' />
      </Pressable>

      <ScrollView className='flex-1'>
        <View className='p-6 gap-6 pb-24'>
          {/* Budget Overview Card */}
          <BudgetCard budget={budget} totalSpent={totalSpent} />

          {/* Expenses Section */}
          <View className='gap-3'>
            <View className='flex-row items-center justify-between'>
              <Text className='text-xl font-bold'>
                Expenses ({expensesData?.expenses?.length || 0})
              </Text>
            </View>

            {expensesData?.expenses && expensesData.expenses.length > 0 ? (
              <View className='gap-3'>
                {expensesData.expenses.map((expense: Expense) => (
                  <ExpenseCard
                    key={expense.expense_id}
                    expense={expense}
                    onPress={() => {
                      // Could navigate to expense detail or open a modal
                      console.log('Expense pressed:', expense.expense_id)
                    }}
                  />
                ))}
              </View>
            ) : (
              <Card>
                <CardContent className='py-12'>
                  <Text className='text-muted-foreground text-center text-base'>
                    No expenses found for this budget
                  </Text>
                  <Text className='text-muted-foreground text-center mt-2 text-sm'>
                    Expenses linked to this budget will appear here
                  </Text>
                </CardContent>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default BudgetDetails