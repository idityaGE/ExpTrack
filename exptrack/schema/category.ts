import { z } from "zod";

export interface Category {
  categoryName: string;
  category_id: number;
  createdAt: string;
  updatedAt: string;
  user_id: string;
}

export const CreateCategorySchema = z.object({
  categoryName: z.string().min(2, "Category name is required"),
});

export type CreateCategoryType = z.infer<typeof CreateCategorySchema>;
