import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

const Home = () => {
  const router = useRouter()
  return (
    <SafeAreaView className='flex-1 bg-white items-center'>
      {/* <TouchableOpacity className='border px-4 py-2 bg-slate-900 w-2/5 mx-auto rounded-lg' onPress={() => router.navigate('/(auth)/login')}>
        <Text className='text-white text-2xl text-center'>Log In</Text>
      </TouchableOpacity> */}
        <Text>Home</Text>
    </SafeAreaView>
  )
}

export default Home