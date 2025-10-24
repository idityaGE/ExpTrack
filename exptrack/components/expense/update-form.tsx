import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea"
import { Text } from '@/components/ui/text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon, Plus } from 'lucide-react-native'
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  NativeSelectScrollView,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { UpdateExpenseSchema, UpdateExpenseType, Expense } from "@/schema/expense"
import { CreateCategorySchema, CreateCategoryType } from '@/schema/category';
import { useMutation, useQuery } from '@tanstack/react-query'
import { updateExpense } from '@/api/expense'
import { getAllCategories, createCategory } from '@/api/category';
import { getAllBudget } from '@/api/budget';
import { ApiError } from '@/schema'
import { useRef, useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, type TextInput } from 'react-native';
import type { TriggerRef } from '@rn-primitives/select';

export const UpdateExpenseForm = ({
  expense,
  onSuccess
}: {
  expense: Expense,
  onSuccess: () => void
}) => {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<UpdateExpenseType>({
    resolver: zodResolver(UpdateExpenseSchema),
    defaultValues: {
      name: expense.name,
      amount: expense.amount / 100,
      date: expense.date,
      description: expense.description || undefined,
      categoryId: expense.category_id || undefined,
      budgetId: expense.budget_id || undefined,
    }
  })

  useEffect(() => {
    reset({
      name: expense.name,
      amount: expense.amount / 100,
      date: expense.date,
      description: expense.description || undefined,
      categoryId: expense.category_id || undefined,
      budgetId: expense.budget_id || undefined,
    })
  }, [expense, reset])

  const { control: categoryControl, handleSubmit: handleCategorySubmit, formState: { errors: categoryErrors }, reset: resetCategory } = useForm<CreateCategoryType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      categoryName: "",
    }
  })

  const { data: categoriesData, refetch: refetchCategories } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories,
  })

  const { data: budgetsData } = useQuery({
    queryKey: ['budgets', 'all'],
    queryFn: getAllBudget,
  })

  const updateExpenseMutation = useMutation({
    mutationFn: (data: UpdateExpenseType) => updateExpense(expense.expense_id, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: Error) => {
      if (error instanceof ApiError) {
        console.error('Update Expense Failed:', error.message);
      } else {
        console.error('Update Expense Failed:', 'An unexpected error occurred');
      }
    }
  })

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      refetchCategories();
      resetCategory();
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      if (error instanceof ApiError) {
        console.error('Create Category Failed:', error.message);
      } else {
        console.error('Create Category Failed:', 'An unexpected error occurred');
      }
    }
  })

  const onSubmit = handleSubmit(async (data: UpdateExpenseType) => {
    const formattedData: UpdateExpenseType = {};

    if (data.name !== undefined) {
      formattedData.name = data.name;
    }

    if (data.amount !== undefined) {
      formattedData.amount = Number(data.amount * 100);
    }

    if (data.date !== undefined) {
      const dateObj = new Date(data.date);
      formattedData.date = dateObj.toISOString().split('T')[0];
    }

    if (data.description !== undefined) {
      formattedData.description = data.description;
    }

    if (data.categoryId !== undefined) {
      formattedData.categoryId = data.categoryId;
    }

    if (data.budgetId !== undefined) {
      formattedData.budgetId = data.budgetId;
    }

    updateExpenseMutation.mutate(formattedData);
  })

  const onCategorySubmit = handleCategorySubmit(async (data: CreateCategoryType) => {
    createCategoryMutation.mutate(data);
  })

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const amountFieldRef = useRef<TextInput>(null);
  const dateFieldRef = useRef<TextInput>(null);
  const descriptionFieldRef = useRef<TextInput>(null);

  const categorySelectRef = useRef<TriggerRef>(null);
  const budgetSelectRef = useRef<TriggerRef>(null);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 12,
    right: 12,
  };

  const { error: expenseError, isError: isExpenseError } = updateExpenseMutation;
  const { error: categoryError, isError: isCategoryError } = createCategoryMutation;

  return (
    <ScrollView className='flex-1 bg-background'>
      <View className='p-6 pb-24'>
        <View className='gap-6'>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className='gap-2'>
                <Label nativeID='name' className='text-base font-medium'>Name</Label>
                <Input
                  placeholder="Expense Name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                  onSubmitEditing={() => {
                    amountFieldRef.current?.focus();
                  }}
                  className='h-12'
                />
                {errors.name && <Text className='text-destructive text-sm mt-1'>{errors.name.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className='gap-2'>
                <Label nativeID='amount' className='text-base font-medium'>Amount</Label>
                <Input
                  placeholder="Expense Amount"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(Number(text))}
                  value={value ? value.toString() : ''}
                  ref={amountFieldRef}
                  onSubmitEditing={() => {
                    dateFieldRef.current?.focus();
                  }}
                  className='h-12'
                />
                {errors.amount && <Text className='text-destructive text-sm mt-1'>{errors.amount.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <View className='gap-2'>
                <Label nativeID='date' className='text-base font-medium'>Date</Label>
                <Button
                  variant="outline"
                  className='h-12 justify-start'
                  onPress={() => {
                    setShowDatePicker(true);
                  }}
                >
                  <Text className='text-base'>
                    {value ? new Date(value).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Select date'}
                  </Text>
                </Button>
                {showDatePicker && value && (
                  <DateTimePicker
                    value={new Date(value)}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        onChange(selectedDate.toISOString());
                      }
                    }}
                  />)}
                {errors.date && <Text className='text-destructive text-sm mt-1'>{errors.date.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className='gap-2'>
                <Label nativeID='description' className='text-base font-medium'>Description</Label>
                <Textarea
                  placeholder="Expense Description (Optional)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                  multiline
                  numberOfLines={4}
                  ref={descriptionFieldRef}
                  style={{ textAlignVertical: 'top' }}
                  onSubmitEditing={() => {
                    categorySelectRef.current?.focus();
                  }}
                  className='min-h-[100px]'
                />
                {errors.description && <Text className='text-destructive text-sm mt-1'>{errors.description.message}</Text>}
              </View>
            )}
          />

          <View className='gap-2'>
            <Label nativeID='category' className='text-base font-medium'>Category</Label>
            <View className='flex-row gap-2'>
              <Controller
                control={control}
                name="categoryId"
                render={({ field: { onChange, value } }) => {
                  const selectedCategory = value
                    ? categoriesData?.categories?.find(c => c.category_id === value)
                    : undefined;

                  return (
                    <View className='flex-1'>
                      <Select
                        value={selectedCategory ? {
                          value: selectedCategory.category_id.toString(),
                          label: selectedCategory.categoryName
                        } : undefined}
                        onValueChange={(option) => onChange(option ? Number(option.value) : undefined)}
                      >
                        <SelectTrigger className='h-12 flex-1' ref={categorySelectRef}>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent insets={contentInsets} className="max-w-md">
                          <ScrollView>
                            <SelectGroup>
                              <SelectLabel>Select Category</SelectLabel>
                              {categoriesData?.categories?.map((category) => (
                                <SelectItem
                                  key={category.category_id}
                                  value={category.category_id.toString()}
                                  label={category.categoryName}
                                >
                                  <Text>{category.categoryName}</Text>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </ScrollView>
                        </SelectContent>
                      </Select>
                    </View>
                  );
                }}
              />

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className='h-12 w-12'>
                    <Icon as={Plus} size={20} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create new Category</DialogTitle>
                    <DialogDescription>
                      Add a new category to organize your expenses.
                    </DialogDescription>
                  </DialogHeader>
                  <View className="gap-4 py-4">
                    <Controller
                      control={categoryControl}
                      name="categoryName"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View className="gap-3">
                          <Label nativeID="categoryName">Category Name</Label>
                          <Input
                            placeholder="e.g., Food, Transport"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                          />
                          {categoryErrors.categoryName && (
                            <Text className='text-destructive text-sm'>
                              {categoryErrors.categoryName.message}
                            </Text>
                          )}
                        </View>
                      )}
                    />
                  </View>
                  {isCategoryError && (
                    <Alert variant="destructive" icon={AlertCircleIcon}>
                      <AlertTitle className="font-medium">Failed to Create Category</AlertTitle>
                      <AlertDescription>{categoryError?.message || "An unexpected error occurred"}</AlertDescription>
                    </Alert>
                  )}
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        onPress={() => {
                          resetCategory();
                          setDialogOpen(false);
                        }}
                      >
                        <Text>Cancel</Text>
                      </Button>
                    </DialogClose>
                    <Button
                      onPress={onCategorySubmit}
                      disabled={createCategoryMutation.isPending}
                    >
                      <Text>
                        {createCategoryMutation.isPending ? 'Adding...' : 'Add Category'}
                      </Text>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </View>
            {errors.categoryId && <Text className='text-destructive text-sm mt-1'>{errors.categoryId.message}</Text>}
          </View>

          <Controller
            control={control}
            name="budgetId"
            render={({ field: { onChange, value } }) => {
              const selectedBudget = value
                ? budgetsData?.budgets?.find(b => b.budget_id === value)
                : undefined;

              return (
                <View className='gap-2'>
                  <Label nativeID='budget' className='text-base font-medium'>Budget (Optional)</Label>
                  <Select
                    value={selectedBudget ? {
                      value: selectedBudget.budget_id,
                      label: selectedBudget.name
                    } : undefined}
                    onValueChange={(option) => onChange(option?.value)}
                  >
                    <SelectTrigger className='w-full h-12' ref={budgetSelectRef} >
                      <SelectValue placeholder="Select Budget" />
                    </SelectTrigger>
                    <SelectContent insets={contentInsets} className="w-full max-w-md">
                      <NativeSelectScrollView>
                        <SelectGroup>
                          <SelectLabel>Select Budget</SelectLabel>
                          {budgetsData?.budgets?.map((budget) => (
                            <SelectItem
                              key={budget.budget_id}
                              value={budget.budget_id}
                              label={budget.name}
                            >
                              <Text>{budget.name}</Text>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </NativeSelectScrollView>
                    </SelectContent>
                  </Select>
                  {errors.budgetId && <Text className='text-destructive text-sm mt-1'>{errors.budgetId.message}</Text>}
                </View>
              );
            }}
          />

          {isExpenseError && (
            <Alert variant="destructive" icon={AlertCircleIcon}>
              <AlertTitle className="font-medium">Failed to Update Expense</AlertTitle>
              <AlertDescription>{expenseError?.message || "An unexpected error occurred"}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full h-12 mt-4"
            onPress={onSubmit}
            disabled={updateExpenseMutation.isPending}
          >
            <Text className='font-semibold text-base'>
              {updateExpenseMutation.isPending ? 'Updating...' : 'Update Expense'}
            </Text>
          </Button>

        </View>
      </View>
    </ScrollView>
  )
}
