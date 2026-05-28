/** Standard API response wrapper */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]> | string[];
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function success<T>(data: T, message?: string): ApiSuccessResponse<T> {
  return { success: true, data, ...(message ? { message } : {}) };
}

export function error(message: string, errors?: Record<string, string[]> | string[]): ApiErrorResponse {
  return { success: false, message, ...(errors ? { errors } : {}) };
}
