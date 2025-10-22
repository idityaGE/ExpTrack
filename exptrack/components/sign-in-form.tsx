import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, type TextInput, View, Alert } from 'react-native';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { LoginUserType, LoginUser } from "@/schema/user"
import { useMutation } from '@tanstack/react-query'
import { loginUser } from '@/api/user'
import { ApiError } from '@/schema'
import { useAuth } from '@/store/auth-context'

export function SignInForm() {
  const router = useRouter()
  const { login } = useAuth()
  const passwordInputRef = React.useRef<TextInput>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginUserType>({
    resolver: zodResolver(LoginUser),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      await login(
        {
          userId: data.user.user_id,
          name: data.user.name,
          email: data.user.email,
        },
        data.token
      );
      router.replace('/');
    },
    onError: (error: Error) => {
      if (error instanceof ApiError) {
        Alert.alert('Login Failed', error.message);
      } else {
        Alert.alert('Login Failed', 'An unexpected error occurred');
      }
    }
  })

  const onSubmit = handleSubmit((data: LoginUserType) => {
    loginMutation.mutate(data);
  })

  const onEmailSubmitEditing = () => {
    passwordInputRef.current?.focus();
  }

  return (
    <View className="gap-6">
      <Card className="border-border sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-3xl sm:text-left">Sign in</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    id="email"
                    placeholder="m@example.com"
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                    onSubmitEditing={onEmailSubmitEditing}
                    returnKeyType="next"
                    submitBehavior="submit"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.email && (
                <Text className="text-sm text-destructive">{errors.email.message}</Text>
              )}
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
              </View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    ref={passwordInputRef}
                    id="password"
                    secureTextEntry
                    returnKeyType="send"
                    onSubmitEditing={onSubmit}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.password && (
                <Text className="text-sm text-destructive">{errors.password.message}</Text>
              )}
            </View>
            <Button
              className="w-full"
              onPress={onSubmit}
              disabled={loginMutation.isPending}
            >
              <Text>{loginMutation.isPending ? 'Signing in...' : 'Continue'}</Text>
            </Button>
          </View>
          <Text className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Pressable
              onPress={() => {
                router.push('/auth/register');
              }}>
              <Text className="text-sm underline underline-offset-4">Sign up</Text>
            </Pressable>
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}
