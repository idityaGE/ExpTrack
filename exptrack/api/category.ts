import { apiClient } from "./expense";
import type { Category, CreateCategoryType } from "@/schema/category";
import { ApiResponse } from "@/schema";

interface CategoryResponse {
  category: Category;
}

interface AllCategoryResponse {
  categories: Category[];
}

export const createCategory = async (
  categoryData: CreateCategoryType
): Promise<CategoryResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<CategoryResponse>>(
      `/category`,
      categoryData
    );
    return response.data.data;
  } catch (error) {
    throw new Error("Failed to create category");
  }
}

export const getAllCategories = async (): Promise<AllCategoryResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<AllCategoryResponse>>(
      '/category'
    );
    return response.data.data;
  } catch (error) {
    throw new Error("Failed to fetch categories");
  }
}

export const deleteCategory = async (
  categoryId: string
): Promise<void> => {
  try {
    await apiClient.delete(`/category/${categoryId}`);
  } catch (error) {
    throw new Error("Failed to delete category");
  }
}