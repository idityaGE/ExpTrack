import { type ApiResponse, ApiError } from "@/schema";
import axios, { AxiosInstance } from "axios";
import { Expense, CreateExpenseType, UpdateExpenseType } from "@/schema/expense";
import { getItemAsync } from 'expo-secure-store'

interface ExpenseResponse {
  expense: Expense;
}

interface AllExpenseResponse {
  expenses: Expense[];
}

export interface AllExpenseResponseWithPagination extends AllExpenseResponse {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    count: number;
  };
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { data, status } = error.response;
      if (data.success === false) {
        throw new ApiError(
          data.status || status,
          data.message || "An error occurred",
          data.success
        );
      }
    }
    throw new ApiError(500, "Network error or server unavailable");
  }
);

export const createExpense = async (
  expenseData: CreateExpenseType
): Promise<ExpenseResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<ExpenseResponse>>(
      `/expense`,
      expenseData
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to create expense");
  }
}

export const getAllExpense = async (): Promise<AllExpenseResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<AllExpenseResponse>>(
      '/expense'
    );
    return response.data.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch expenses");
  }
}

export const getExpensePaginated = async ({ pageParam }: { pageParam: number }): Promise<AllExpenseResponseWithPagination> => {
  const limit = 10;
  try {
    const response = await apiClient.get<ApiResponse<AllExpenseResponseWithPagination>>(
      `/expense?limit=${limit}&offset=${(pageParam - 1) * limit}`
    );
    return response.data.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch expenses");
  }
}

export const getExpensesByBudgetId = async (budgetId: string): Promise<AllExpenseResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<AllExpenseResponse>>(
      '/expenses/budget/' + budgetId
    );
    return response.data.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch expenses");
  }
}

export const getExpenseById = async (expenseId: string): Promise<ExpenseResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<ExpenseResponse>>(
      '/expense/' + expenseId
    );
    return response.data.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch expense");
  }
}

export const updateExpense = async (
  expenseId: string,
  expenseData: UpdateExpenseType
): Promise<ExpenseResponse> => {
  try {
    const response = await apiClient.put<ApiResponse<ExpenseResponse>>(
      `/expense/${expenseId}`,
      expenseData
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to update expense");
  }
}

export const deleteExpense = async (expenseId: string): Promise<void> => {
  try {
    await apiClient.delete<ApiResponse<null>>(
      `/expense/${expenseId}`
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to delete expense");
  }
}