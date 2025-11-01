import { Text } from '@/components/ui/text'
import { getExpensePaginated, deleteExpense } from '@/api/expense'
import { View, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Expense } from '@/schema/expense'
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PlusIcon } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { useRef, useState, useCallback, useMemo } from 'react'
import { useColorScheme } from 'nativewind'
import { ExpenseCard } from '@/components/expense/expense-card';
import { Button } from '@/components/ui/button'

import { FlashList } from '@shopify/flash-list'
import { RefreshControl } from 'react-native'
import { useInfiniteQuery } from '@tanstack/react-query'

const ExpensesScreen = () => {
  const router = useRouter()
  const { colorScheme } = useColorScheme()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    error,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['expenses', 'paginated'],
    initialPageParam: 1,
    queryFn: getExpensePaginated,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = lastPage.pagination.offset + lastPage.pagination.limit;
      if (nextOffset < lastPage.pagination.total) {
        return allPages.length + 1;
      }
      return undefined;
    }
  })

  const expenses = useMemo(
    () => data?.pages.flatMap((page) => page.expenses) || [],
    [data]
  )

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handlePresentModalPress = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
    bottomSheetModalRef.current?.present();
  }, []);

  const handleEdit = () => {
    if (selectedExpense) {
      bottomSheetModalRef.current?.dismiss();
      router.push(`/expenses/update/${selectedExpense.expense_id}`);
    }
  };

  const handleDelete = async () => {
    if (selectedExpense) {
      bottomSheetModalRef.current?.dismiss();
      await deleteExpense(selectedExpense.expense_id);
      await refetch();
    }
  };

  return (
    <BottomSheetModalProvider>
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

        {isLoading && (
          <View className='flex-1 items-center justify-center py-12'>
            <ActivityIndicator size="large" />
            <Text className='text-muted-foreground mt-4'>Loading expenses...</Text>
          </View>
        )}

        {error && (
          <View className='p-4'>
            <Card className='border-destructive'>
              <CardContent className='pt-6'>
                <Text className='text-destructive text-center'>
                  Error loading expenses: {error.message}
                </Text>
              </CardContent>
            </Card>
          </View>
        )}

        {!isLoading && !error && expenses.length === 0 && (
          <View className='flex-1 items-center justify-center py-20'>
            <Text className='text-muted-foreground text-center text-lg'>
              No expenses found.
            </Text>
            <Text className='text-muted-foreground text-center mt-2'>
              Tap the + button to add your first expense
            </Text>
          </View>
        )}

        {!isLoading && !error && expenses.length > 0 && (
          <FlashList
            data={expenses}
            keyExtractor={(item) => item.expense_id}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            onEndReachedThreshold={0.2}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            refreshControl={
              <RefreshControl
                tintColor={'blue'}
                refreshing={isRefetching}
                onRefresh={refetch}
              />
            }
            renderItem={({ item }) => (
              <View style={{ marginBottom: 12 }}>
                <ExpenseCard
                  expense={item}
                  onPress={() => handlePresentModalPress(item)}
                />
              </View>
            )}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator color="blue" size="small" />
                </View>
              ) : null
            }
          />
        )}

        <BottomSheetModal
          ref={bottomSheetModalRef}
          enablePanDownToClose
          containerStyle={{ flex: 1, zIndex: 20 }}
          backgroundStyle={{
            backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f7',
          }}
          handleIndicatorStyle={{
            backgroundColor: colorScheme === 'dark' ? '#666' : '#ccc'
          }}
        >
          <BottomSheetView className='px-6 pb-8 flex-1'>
            {selectedExpense && (
              <View className='gap-6'>
                <View className='pb-4 border-b border-border'>
                  <Text className='text-3xl font-bold mb-2'>{selectedExpense.name}</Text>
                  <View className='bg-primary/10 self-start px-4 py-2 rounded-full'>
                    <Text className='font-bold text-primary text-xl'>
                      ₹ {(selectedExpense.amount / 100).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View className='gap-4'>
                  <View>
                    <Text className='text-sm text-muted-foreground font-semibold mb-1'>DATE</Text>
                    <Text className='text-base'>
                      {new Date(selectedExpense.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>

                  {selectedExpense.description && (
                    <View>
                      <Text className='text-sm text-muted-foreground font-semibold mb-1'>DESCRIPTION</Text>
                      <Text className='text-base leading-6'>{selectedExpense.description}</Text>
                    </View>
                  )}

                  <View className='flex-row gap-2'>
                    <View className='flex-1'>
                      <Text className='text-sm text-muted-foreground font-semibold mb-1'>CREATED</Text>
                      <Text className='text-xs text-muted-foreground'>
                        {new Date(selectedExpense.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className='flex-1'>
                      <Text className='text-sm text-muted-foreground font-semibold mb-1'>UPDATED</Text>
                      <Text className='text-xs text-muted-foreground'>
                        {new Date(selectedExpense.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className='gap-3 pt-2 flex-row justify-between'>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex-1 p-4 rounded-xl h-14 active:opacity-80">
                        <Text className="font-semibold text-base">Delete Expense</Text>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete "{selectedExpense?.name}" and remove the
                          data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          <Text className="font-semibold">Cancel</Text>
                        </AlertDialogCancel>
                        <AlertDialogAction onPress={handleDelete} className="bg-destructive">
                          <Text className="text-white">Delete</Text>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Pressable
                    onPress={handleEdit}
                    className='bg-primary flex-1 p-4 rounded-xl h-14 active:opacity-80 items-center justify-center'
                  >
                    <Text className='text-primary-foreground text-center font-semibold text-base'>
                      Edit Expense
                    </Text>
                  </Pressable>
                </View>
                {/* extra space for NativeTab  */}
                <View className='h-14' />
              </View>
            )}
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  )
}


export default ExpensesScreen