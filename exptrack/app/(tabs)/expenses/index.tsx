import { Text } from '@/components/ui/text'
import { getAllExpense } from '@/api/expense'
import { useQuery } from '@tanstack/react-query'
import { ScrollView, View, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Expense } from '@/schema/expense'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusIcon } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'

const ExpensesScreen = () => {
  const router = useRouter()
  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', 'all'],
    queryFn: getAllExpense,
  })

  return (
    <View className='flex-1 bg-primary-foreground'>
      <Pressable
        onPress={() => router.push('/expenses/create')}
        className='absolute right-8 bottom-28 bg-foreground rounded-full w-14 h-14 z-10 items-center justify-center shadow-lg'
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
              <Text className='text-muted-foreground mt-4'>Loading expenses...</Text>
            </View>
          )}

          {error && (
            <Card className='border-destructive'>
              <CardContent className='pt-6'>
                <Text className='text-destructive text-center'>
                  Error loading expenses: {error.message}
                </Text>
              </CardContent>
            </Card>
          )}

          {data && data.expenses.length === 0 && !isLoading && (
            <View className='flex-1 items-center justify-center py-20'>
              <Text className='text-muted-foreground text-center text-lg'>
                No expenses found.
              </Text>
              <Text className='text-muted-foreground text-center mt-2'>
                Tap the + button to add your first expense
              </Text>
            </View>
          )}

          {data && data.expenses.map((expense: Expense) => (
            <ExpenseCard key={expense.expense_id} expense={expense} />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const ExpenseCard = ({ expense }: { expense: Expense }) => {
  const router = useRouter()

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
      onPress={() => router.push(`/expenses/update/${expense.expense_id}`)}
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
          <CardContent className='pt-0'>
            <Text className='text-muted-foreground text-sm' numberOfLines={2}>
              {expense.description}
            </Text>
          </CardContent>
        )}
      </Card>
    </Pressable>
  )
}

export default ExpensesScreen