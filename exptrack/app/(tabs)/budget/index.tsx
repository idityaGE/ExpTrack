import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { useQuery } from '@tanstack/react-query'
import { getAllBudget } from '@/api/budget'
import { PlusIcon } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import { BudgetCard } from '@/components/budget/budget-card'

const BudgetScreen = () => {
  const router = useRouter()
  const { data, isLoading, error } = useQuery({
    queryKey: ['budgets', 'all'],
    queryFn: getAllBudget,
  })

  return (
    <View className='flex-1 bg-primary-foreground'>
      <Pressable
        onPress={() => router.push('/budget/create')}
        className='absolute right-8 bottom-28 bg-primary rounded-full w-14 h-14 z-10 items-center justify-center shadow-lg active:opacity-80'
        style={{
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
        }}
      >
        <Icon as={PlusIcon} size={28} className='text-primary-foreground' />
      </Pressable>

      <ScrollView className='flex-1'>
        <View className='p-4 gap-3 pb-24'>
          {isLoading && (
            <View className='flex-1 items-center justify-center py-12'>
              <ActivityIndicator size="large" />
              <Text className='text-muted-foreground mt-4'>Loading budgets...</Text>
            </View>
          )}

          {error && (
            <Card className='border-destructive'>
              <CardContent className='pt-6'>
                <Text className='text-destructive text-center'>
                  Error loading budgets: {error.message}
                </Text>
              </CardContent>
            </Card>
          )}

          {data && data.budgets.length === 0 && !isLoading && (
            <View className='flex-1 items-center justify-center py-20'>
              <Text className='text-muted-foreground text-center text-lg'>
                No budgets found.
              </Text>
              <Text className='text-muted-foreground text-center mt-2'>
                Tap the + button to create your first budget
              </Text>
            </View>
          )}

          {data && data.budgets.map((budget) => (
            <BudgetCard 
              key={budget.budget_id} 
              budget={budget} 
              totalSpent={budget.totalSpent} 
            />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default BudgetScreen