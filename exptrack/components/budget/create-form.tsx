import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react-native'
import DateTimePicker from '@react-native-community/datetimepicker';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { CreateBudgetSchema, CreateBudgetType } from "@/schema/budget"
import { useMutation } from '@tanstack/react-query'
import { createBudget } from '@/api/budget'
import { ApiError } from '@/schema'
import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Platform, type TextInput } from 'react-native';

export const CreateBudgetForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { control, handleSubmit, formState: { errors }, watch } = useForm<CreateBudgetType>({
    resolver: zodResolver(CreateBudgetSchema),
    defaultValues: {
      name: "",
      amount: undefined,
      startDate: (new Date()).toUTCString(),
      endDate: (new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toUTCString(), // 30 days from now
    }
  })

  const createBudgetMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: Error) => {
      if (error instanceof ApiError) {
        console.error('Create Budget Failed:', error.message);
      } else {
        console.error('Create Budget Failed:', 'An unexpected error occurred');
      }
    }
  })

  const onSubmit = handleSubmit(async (data: CreateBudgetType) => {
    const startDateObj = new Date(data.startDate);
    const endDateObj = new Date(data.endDate);
    const formattedStartDate = startDateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedEndDate = endDateObj.toISOString().split('T')[0]; // YYYY-MM-DD

    const formattedData = {
      ...data,
      amount: Number(data.amount * 100),
      startDate: formattedStartDate,
      endDate: formattedEndDate
    };
    createBudgetMutation.mutate(formattedData);
  })

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const amountFieldRef = useRef<TextInput>(null);

  const { error: budgetError, isError: isBudgetError } = createBudgetMutation;

  const startDate = watch('startDate');

  return (
    <ScrollView className='flex-1 bg-background'>
      <View className='p-6 pb-24'>
        <View className='gap-6'>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className='gap-2'>
                <Label nativeID='name' className='text-base font-medium'>Budget Name</Label>
                <Input
                  placeholder="e.g., Monthly Budget, Vacation Fund"
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
                <Label nativeID='amount' className='text-base font-medium'>Budget Amount</Label>
                <Input
                  placeholder="Enter budget amount"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(Number(text))}
                  value={value ? value.toString() : ''}
                  ref={amountFieldRef}
                  className='h-12'
                />
                {errors.amount && <Text className='text-destructive text-sm mt-1'>{errors.amount.message}</Text>}
              </View>
            )}
          />

          <View className='flex-row gap-4'>
            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, value } }) => (
                <View className='flex-1 gap-2'>
                  <Label nativeID='startDate' className='text-base font-medium'>Start Date</Label>
                  <Button
                    variant="outline"
                    className='h-12 justify-start'
                    onPress={() => {
                      setShowStartDatePicker(true);
                    }}
                  >
                    <Text className='text-sm'>{new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</Text>
                  </Button>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={new Date(value)}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        onChange(selectedDate ? selectedDate.toUTCString() : value);
                      }}
                    />)}
                  {errors.startDate && <Text className='text-destructive text-sm mt-1'>{errors.startDate.message}</Text>}
                </View>
              )}
            />

            <Controller
              control={control}
              name="endDate"
              render={({ field: { onChange, value } }) => (
                <View className='flex-1 gap-2'>
                  <Label nativeID='endDate' className='text-base font-medium'>End Date</Label>
                  <Button
                    variant="outline"
                    className='h-12 justify-start'
                    onPress={() => {
                      setShowEndDatePicker(true);
                    }}
                  >
                    <Text className='text-sm'>{new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</Text>
                  </Button>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={new Date(value)}
                      mode="date"
                      display="spinner"
                      minimumDate={new Date(startDate)}
                      onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        onChange(selectedDate ? selectedDate.toUTCString() : value);
                      }}
                    />)}
                  {errors.endDate && <Text className='text-destructive text-sm mt-1'>{errors.endDate.message}</Text>}
                </View>
              )}
            />
          </View>

          {/* Budget Period Info */}
          <View className='bg-muted p-4 rounded-lg'>
            <Text className='text-sm text-muted-foreground'>
              Budget period: {Math.ceil((new Date(watch('endDate')).getTime() - new Date(watch('startDate')).getTime()) / (1000 * 60 * 60 * 24))} days
            </Text>
          </View>

          {isBudgetError && (
            <Alert variant="destructive" icon={AlertCircleIcon}>
              <AlertTitle className="font-medium">Failed to Create Budget</AlertTitle>
              <AlertDescription>{budgetError?.message || "An unexpected error occurred"}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full h-12 mt-4"
            onPress={onSubmit}
            disabled={createBudgetMutation.isPending}
          >
            <Text className='font-semibold text-base'>
              {createBudgetMutation.isPending ? 'Creating...' : 'Create Budget'}
            </Text>
          </Button>

        </View>
      </View>
    </ScrollView>
  )
}
