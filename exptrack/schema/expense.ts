import { z } from 'zod';

export interface Expense {
  amount: number;
  budget_id: string;
  category_id: number;
  createdAt: string;
  date: string;
  description: string;
  expense_id: string;
  name: string;
  updatedAt: string;
  user_id: string;
}

export const CreateExpenseSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format' }),
  description: z.string().optional(),
  categoryId: z.number().optional(),
  budgetId: z.string().optional(),
})

export type CreateExpenseType = z.infer<typeof CreateExpenseSchema>;

export const UpdateExpenseSchema = CreateExpenseSchema.partial();

export type UpdateExpenseType = Partial<CreateExpenseType>;
