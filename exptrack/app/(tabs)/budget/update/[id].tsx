import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'

const UpdateBudgetDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View>
      <Text>Update Budget Details for ID: {id}</Text>
    </View>
  )
}

export default UpdateBudgetDetails