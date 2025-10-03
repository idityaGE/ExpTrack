import { View, Text } from 'react-native'
import { Link } from 'expo-router'
import React from 'react'


const Index = () => {
  return (
    <View>
      <Text>Index</Text>
      <Link href={{
        pathname: '/setting/details/[id]',
        params: { id: '123' }
      }}>
        <Text>Go to Details</Text>
      </Link>
    </View>
  )
}

export default Index