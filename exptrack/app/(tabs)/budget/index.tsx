import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { useQuery } from '@tanstack/react-query'
import { getAllBudget } from '@/api/budget'
import { Budget } from '@/schema/budget'
import { PlusIcon } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'

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
            <BudgetCard key={budget.budget_id} budget={budget} />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const BudgetCard = ({ budget }: { budget: Budget & { totalSpent: number } }) => {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateRange = () => {
    return `${formatDate(budget.startDate)} - ${formatDate(budget.endDate)}`
  }

  const totalAmount = budget.amount / 100
  const spentAmount = budget.totalSpent / 100
  const remainingAmount = totalAmount - spentAmount
  const progressPercentage = Math.min((spentAmount / totalAmount) * 100, 100)

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'bg-destructive'
    if (progressPercentage >= 80) return 'bg-orange-500'
    if (progressPercentage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (progressPercentage >= 100) return 'Over budget!'
    if (progressPercentage >= 80) return 'Almost spent'
    return 'On track'
  }

  const getStatusColor = () => {
    if (progressPercentage >= 100) return 'text-destructive'
    if (progressPercentage >= 80) return 'text-orange-500'
    return 'text-green-600'
  }

  return (
    <Pressable
      onPress={() => router.push(`/budget/${budget.budget_id}`)}
      className='active:opacity-70'
    >
      <Card>
        <CardHeader className='pb-3'>
          <View className='flex-row items-start justify-between'>
            <View className='flex-1'>
              <CardTitle className='text-lg'>{budget.name}</CardTitle>
              <CardDescription className='mt-1'>
                {formatDateRange()}
              </CardDescription>
            </View>
            <View className='items-end'>
              <Text className={`font-semibold text-sm ${getStatusColor()}`}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </CardHeader>

        <CardContent className='gap-3'>
          <View className='gap-2'>
            <View className='flex-row justify-between'>
              <Text className='text-sm text-muted-foreground'>
                Spent: ₹{spentAmount.toFixed(2)}
              </Text>
              <Text className='text-sm text-muted-foreground'>
                Total: ₹{totalAmount.toFixed(2)}
              </Text>
            </View>

            <View className='h-3 bg-muted rounded-full overflow-hidden'>
              <View
                className={`h-full ${getProgressColor()} rounded-full`}
                style={{ width: `${progressPercentage}%` }}
              />
            </View>

            <View className='flex-row justify-between items-center'>
              <Text className='text-xs text-muted-foreground'>
                {progressPercentage.toFixed(1)}% used
              </Text>
              <Text className={`text-sm font-semibold ${remainingAmount < 0 ? 'text-destructive' : 'text-primary'}`}>
                {remainingAmount < 0 ? 'Over by ' : 'Remaining: '}
                ₹{Math.abs(remainingAmount).toFixed(2)}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  )
}

export default BudgetScreen