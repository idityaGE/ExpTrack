import { z } from 'zod';

export interface Budget {
  amount: number;
  budget_id: string;
  createdAt: string;
  endDate: string;
  name: string;
  startDate: string;
  updatedAt: string;
  user_id: string;
}

export const CreateBudgetSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  amount: z.number().positive('Amount must be positive'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format' }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format' }),
})

export type CreateBudgetType = z.infer<typeof CreateBudgetSchema>;

export const UpdateBudgetSchema = CreateBudgetSchema.partial();

export type UpdateBudgetType = Partial<CreateBudgetType>;
