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
import { Pressable, type TextInput, View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react-native';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { RegisterUserType, RegisterUser } from "@/schema/user"
import { useMutation } from '@tanstack/react-query'
import { registerUser } from '@/api/user'
import { ApiError } from '@/schema'
import { useAuth } from '@/store/auth-context'

export function SignUpForm() {
  const router = useRouter()
  const { login } = useAuth()
  const emailInputRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterUserType>({
    resolver: zodResolver(RegisterUser),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  })

  const registerMutation = useMutation({
    mutationFn: registerUser,
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
        console.log('Registration Failed', error.message);
      } else {
        console.log('Registration Failed', 'An unexpected error occurred');
      }
    }
  })

  const onSubmit = handleSubmit((data: RegisterUserType) => {
    registerMutation.mutate(data);
  })

  const onNameSubmitEditing = () => {
    emailInputRef.current?.focus();
  }

  const onEmailSubmitEditing = () => {
    passwordInputRef.current?.focus();
  }

  const { error, isError } = registerMutation;

  return (
    <View className="gap-6">
      <Card className="border-border sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-3xl sm:text-left">Create your account</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome! Please fill in the details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    id="name"
                    placeholder="Adii"
                    keyboardType="default"
                    autoComplete="name"
                    autoCapitalize="words"
                    onSubmitEditing={onNameSubmitEditing}
                    returnKeyType="next"
                    submitBehavior="submit"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.name && (
                <Text className="text-sm text-destructive">{errors.name.message}</Text>
              )}
            </View>
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    ref={emailInputRef}
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
                    placeholder='**********'
                    secureTextEntry
                    returnKeyType="send"
                    autoCapitalize='none'
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
            <View className='gap-1.5'>
              {isError && (
                <Alert variant="destructive" className="mb-4" icon={AlertCircleIcon}>
                  <AlertTitle className="font-medium">Registration Failed</AlertTitle>
                  <AlertDescription>{error?.message || "An unexpected error occurred"}</AlertDescription>
                </Alert>
              )}
            </View>
            <Button
              className="w-full"
              onPress={onSubmit}
              disabled={registerMutation.isPending}
            >
              <Text>{registerMutation.isPending ? 'Creating account...' : 'Continue'}</Text>
            </Button>
          </View>
          <Text className="text-center text-sm">
            Already have an account?{' '}
            <Pressable
              onPress={() => {
                router.push('/auth/login');
              }}>
              <Text className="text-sm underline underline-offset-4">Sign in</Text>
            </Pressable>
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}
