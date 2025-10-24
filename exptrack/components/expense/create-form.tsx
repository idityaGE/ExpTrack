import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea"
import { Text } from '@/components/ui/text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react-native'
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
// https://github.com/react-native-datetimepicker/datetimepicker?tab=readme-ov-file#usage

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { CreateExpenseSchema, CreateExpenseType } from "@/schema/expense"
import { useMutation, useQuery } from '@tanstack/react-query'
import { createExpense } from '@/api/expense'
import { getAllCategories, } from '@/api/category';
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

  const onSubmit = handleSubmit(async (data: CreateExpenseType) => {
    const dateObj = new Date(data.date);
    const formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

    const formattedData = {
      ...data,
      date: formattedDate
    };

    console.log(formattedData);
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories,
  })


  const { data: budgetsData } = useQuery({
    queryKey: ['budgets', 'all'],
    queryFn: getAllBudget,
  })

  const [showDatePicker, setShowDatePicker] = useState(false);

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
    <ScrollView className='flex-1'>
      <View>

        <View className='p-4 space-y-4'>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Label>Name</Label>
                <Input
                  placeholder="Expense Name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.name && <Text className='text-red-500 mt-1'>{errors.name.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Label>Amount</Label>
                <Input
                  placeholder="Expense Amount"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(Number(text))}
                  value={value ? value.toString() : ''}
                />
                {errors.amount && <Text className='text-red-500 mt-1'>{errors.amount.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <View>
                <Label>Date</Label>
                <Button variant="outline" onPress={() => {
                  setShowDatePicker(true);
                }}>
                  <Text>{new Date(value).toLocaleDateString()}</Text>
                </Button>
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(value)}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      onChange(selectedDate ? selectedDate.toUTCString() : value);
                    }}
                  />)}
                {errors.date && <Text className='text-red-500 mt-1'>{errors.date.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Label>Description</Label>
                <Textarea
                  placeholder="Expense Description"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  multiline
                  numberOfLines={4}
                  style={{ textAlignVertical: 'top' }}
                />
                {errors.description && <Text className='text-red-500 mt-1'>{errors.description.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="categoryId"
            render={({ field: { onChange, value } }) => (
              <View>
                <Label>Category</Label>
                <Select
                  onValueChange={(option) => onChange(option ? Number(option.value) : undefined)}
                >
                  <SelectTrigger className="w-full" ref={categorySelectRef}>
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
                {errors.categoryId && <Text className='text-red-500 mt-1'>{errors.categoryId.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="budgetId"
            render={({ field: { onChange, value } }) => (
              <View>
                <Label>Budget</Label>
                <Select
                  onValueChange={(option) => onChange(option?.value)}
                >
                  <SelectTrigger className="w-full" ref={budgetSelectRef}>
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
                {errors.budgetId && <Text className='text-red-500 mt-1'>{errors.budgetId.message}</Text>}
              </View>
            )}
          />

          <Button
            className="w-full"
            onPress={onSubmit}
          >
            <Text>{'Create'}</Text>
          </Button>

        </View>

      </View>
    </ScrollView>
  )
}