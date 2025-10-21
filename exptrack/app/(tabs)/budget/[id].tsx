import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'

const BudgetDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View>
      <Text>Budget Details for ID: {id}</Text>
    </View>
  )
}

export default BudgetDetails