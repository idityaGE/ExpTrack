import { View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Budget } from '@/schema/budget'

export const BudgetCard = ({ 
  budget, 
  totalSpent 
}: { 
  budget: Budget, 
  totalSpent: number 
}) => {
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
  const spentAmount = totalSpent / 100
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

  const getStatusBgColor = () => {
    if (progressPercentage >= 100) return 'bg-destructive/10'
    if (progressPercentage >= 80) return 'bg-orange-500/10'
    return 'bg-green-600/10'
  }

  return (
    <Pressable
      onPress={() => router.push(`/budget/${budget.budget_id}`)}
      className='active:opacity-70'
    >
      <Card>
        <CardHeader className='pb-4'>
          <View className='flex-row items-start justify-between gap-3'>
            <View className='flex-1'>
              <CardTitle className='text-xl mb-1.5'>{budget.name}</CardTitle>
              <CardDescription className='text-xs'>
                {formatDateRange()}
              </CardDescription>
            </View>
            <View className={`px-3 py-1.5 rounded-full ${getStatusBgColor()}`}>
              <Text className={`font-semibold text-xs ${getStatusColor()}`}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </CardHeader>

        <CardContent className='gap-4 pt-0'>
          {/* Amount Overview */}
          <View className='flex-row items-center justify-between'>
            <View className='flex-1'>
              <Text className='text-xs text-muted-foreground mb-1'>Total Budget</Text>
              <Text className='text-lg font-bold'>
                ₹{totalAmount.toFixed(2)}
              </Text>
            </View>
            <View className='flex-1 items-center'>
              <Text className='text-xs text-muted-foreground mb-1'>Spent</Text>
              <Text className='text-lg font-bold text-primary'>
                ₹{spentAmount.toFixed(2)}
              </Text>
            </View>
            <View className='flex-1 items-end'>
              <Text className='text-xs text-muted-foreground mb-1'>
                {remainingAmount < 0 ? 'Over by' : 'Remaining'}
              </Text>
              <Text className={`text-lg font-bold ${remainingAmount < 0 ? 'text-destructive' : 'text-green-600'}`}>
                ₹{Math.abs(remainingAmount).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className='gap-2'>
            <View className='h-2.5 bg-muted rounded-full overflow-hidden'>
              <View
                className={`h-full ${getProgressColor()} rounded-full transition-all`}
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
            <View className='flex-row justify-between items-center'>
              <Text className='text-xs text-muted-foreground'>
                {progressPercentage.toFixed(1)}% of budget used
              </Text>
              {remainingAmount >= 0 && (
                <Text className='text-xs font-medium text-muted-foreground'>
                  {(100 - progressPercentage).toFixed(1)}% left
                </Text>
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  )
}
