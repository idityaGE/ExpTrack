export type ApiResponse<T> = {
  status: number;
  data: T;
  success: boolean;
}

export type ApiErrorResponse = {
  success: false;
  message: string;
  status: number;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public success: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}