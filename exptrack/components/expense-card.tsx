import { Text } from '@/components/ui/text'
import { View, Pressable } from 'react-native'
import { Expense } from '@/schema/expense'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const ExpenseCard = ({ expense, onPress }: { expense: Expense, onPress: () => void }) => {

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Pressable
      onPress={onPress}
      className='active:opacity-70'
    >
      <Card>
        <CardHeader className='pb-3'>
          <View className='flex-row items-start justify-between'>
            <View className='flex-1'>
              <CardTitle className='text-lg'>{expense.name}</CardTitle>
              <CardDescription className='mt-1'>
                {formatDate(expense.date)}
              </CardDescription>
            </View>
            <View className='bg-primary/10 px-3 py-1.5 rounded-full'>
              <Text className='font-bold text-primary text-base'>
                ₹ {expense.amount / 100}
              </Text>
            </View>
          </View>
        </CardHeader>
        {expense.description && (
          <CardContent className='pt-0 bg-muted rounded-lg mx-4 py-3'>
            <Text className='text-muted-foreground text-sm' numberOfLines={2}>
              {expense.description}
            </Text>
          </CardContent>
        )}
      </Card>
    </Pressable>
  )
}