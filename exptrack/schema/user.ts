import { z } from "zod";

export const LoginUser = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const RegisterUser = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
});

export type LoginUserType = z.infer<typeof LoginUser>;
export type RegisterUserType = z.infer<typeof RegisterUser>;

export const UserSchema = z.object({
  user_id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;