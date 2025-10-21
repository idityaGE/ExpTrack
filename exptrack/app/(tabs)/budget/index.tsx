import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Link, Href } from 'expo-router'

const BudgetScreen = () => {
  const budgetId = '123' // Example budget ID

  return (
    <View className='h-screen flex-1 justify-center items-center'>
      <Text>BudgetScreen Boom Boi</Text>

      <StyledLink href={`/budget/${budgetId}`} label="View" />
      <StyledLink href={`/budget/update/${budgetId}`} label="Edit" />
      <StyledLink href={`/budget/create`} label="Create" />

    </View>
  )
}

function StyledLink({ href, label }: { href: Href; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable className='px-6 py-2 bg-gray-800 rounded-2xl my-5'>
        <Text className='text-center font-semibold text-5xl'>{label}</Text>
      </Pressable>
    </Link>
  );
}

export default BudgetScreen