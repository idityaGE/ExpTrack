import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea"
import { Text } from '@/components/ui/text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon, Plus } from 'lucide-react-native'
import { useRouter } from 'expo-router';
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
import { CreateExpenseSchema, CreateExpenseType } from "@/schema/expense"
import { CreateCategorySchema, CreateCategoryType } from '@/schema/category';
import { useMutation, useQuery } from '@tanstack/react-query'
import { createExpense } from '@/api/expense'
import { getAllCategories, createCategory } from '@/api/category';
import { getAllBudget } from '@/api/budget';
import { ApiError } from '@/schema'
import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, type TextInput } from 'react-native';
import type { TriggerRef } from '@rn-primitives/select';

export const CreateExpenseForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const router = useRouter()
  const { control, handleSubmit, formState: { errors } } = useForm<CreateExpenseType>({
    resolver: zodResolver(CreateExpenseSchema),
    defaultValues: {
      name: "",
      amount: undefined,
      date: (new Date()).toUTCString(),
      description: undefined,
      categoryId: undefined,
      budgetId: undefined,
    }
  })

  // Category form
  const { control: categoryControl, handleSubmit: handleCategorySubmit, formState: { errors: categoryErrors }, reset: resetCategory } = useForm<CreateCategoryType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      categoryName: "",
    }
  })

  const onSubmit = handleSubmit(async (data: CreateExpenseType) => {
    const dateObj = new Date(data.date);
    const formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

    const formattedData = {
      ...data,
      date: formattedDate
    };

    console.log(formattedData);
  })

  const { data: categoriesData, refetch: refetchCategories } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories,
  })


  const { data: budgetsData } = useQuery({
    queryKey: ['budgets', 'all'],
    queryFn: getAllBudget,
  })

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      refetchCategories();
      resetCategory();
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      console.error('Failed to create category:', error);
    }
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
                  value={value}
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
                  <Text className='text-base'>{new Date(value).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</Text>
                </Button>
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(value)}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      onChange(selectedDate ? selectedDate.toUTCString() : value);
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
                  value={value}
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
                render={({ field: { onChange, value } }) => (
                  <View className='flex-1'>
                    <Select
                      onValueChange={(option) => onChange(option ? Number(option.value) : undefined)}
                    >
                      <SelectTrigger className='h-12 flex-1' ref={categorySelectRef}>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent insets={contentInsets} className="w-full max-w-md">
                        <NativeSelectScrollView>
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
                        </NativeSelectScrollView>
                      </SelectContent>
                    </Select>
                  </View>
                )}
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
            render={({ field: { onChange, value } }) => (
              <View className='gap-2'>
                <Label nativeID='budget' className='text-base font-medium'>Budget (Optional)</Label>
                <Select
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
            )}
          />

          <Button
            className="w-full h-12 mt-4"
            onPress={onSubmit}
          >
            <Text className='font-semibold text-base'>Create Expense</Text>
          </Button>

        </View>
      </View>
    </ScrollView>
  )
}