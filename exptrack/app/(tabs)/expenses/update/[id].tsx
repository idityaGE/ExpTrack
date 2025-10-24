import { View } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text'
import { useLocalSearchParams } from 'expo-router'

const UpdateExpenseScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <View>
      <Text>{id}</Text>
    </View>
  )
}

export default UpdateExpenseScreen