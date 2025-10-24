import { type ApiResponse, ApiError } from "@/schema";
import { Budget, CreateBudgetType, UpdateBudgetType } from "@/schema/budget";
import { apiClient } from "./expense";

interface BudgetResponse {
  budget: Budget;
}

interface AllBudgetResponse {
  budgets: (Budget & { totalSpent: number })[];
}

export const createBudget = async (
  budgetData: CreateBudgetType
): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<BudgetResponse>>(
      `/budget`,
      budgetData
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to create budget");
  }
}

export const getAllBudget = async (): Promise<AllBudgetResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<AllBudgetResponse>>(
      '/budget'
    );
    return response.data.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch budgets");
  }
}

export const getBudgetById = async (budgetId: string): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<BudgetResponse>>(
      '/budget/' + budgetId
    );
    return response.data.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch budget");
  }
}

export const updateBudget = async (
  budgetId: string,
  budgetData: UpdateBudgetType
): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.put<ApiResponse<BudgetResponse>>(
      `/budget/${budgetId}`,
      budgetData
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to update budget");
  }
}

export const deleteBudget = async (
  budgetId: string
): Promise<void> => {
  try {
    await apiClient.delete<ApiResponse<null>>(
      `/budget/${budgetId}`
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to delete budget");
  }
}