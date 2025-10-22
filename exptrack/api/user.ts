import { User, LoginUserType, RegisterUserType } from '@/schema/user';
import axios, { AxiosInstance } from 'axios';
import { type ApiResponse, ApiError } from '@/schema';

interface UserResponse {
  user: User;
  token: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { data, status } = error.response;
      if (data.success === false) {
        throw new ApiError(
          data.status || status,
          data.message || 'An error occurred',
          data.success
        );
      }
    }
    throw new ApiError(500, 'Network error or server unavailable');
  }
);

export const loginUser = async (credentials: LoginUserType): Promise<UserResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<UserResponse>>(
      `/user/${credentials.email}`,
      { password: credentials.password }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to login');
  }
};

export const registerUser = async (userData: RegisterUserType): Promise<UserResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<UserResponse>>(
      `/user`,
      userData
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to register');
  }
};