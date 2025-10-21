import { Text, View } from "react-native";
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View className="h-screen flex items-center justify-center p-4">
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link href="/auth/login" >Go to Login</Link>
      <Link href="/auth/register" >Go to Register</Link>
      <Link href="/budget" >Go to Budget</Link>
    </View>
  );
}