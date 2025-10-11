export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export function handleError(error: unknown): AppError {
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      details: error.stack,
    };
  }

  if (typeof error === 'string') {
    return {
      code: 'STRING_ERROR',
      message: error,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    details: error,
  };
}

export function createError(code: string, message: string, details?: any): AppError {
  return {
    code,
    message,
    details,
  };
}

export function createErrorResponse(code: string, message: string, details?: any) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

export function createSuccessResponse(data: any, message?: string) {
  return {
    success: true,
    data,
    message,
  };
}

export function logError(error: AppError, context: string) {
  console.error(`[${context}] Error:`, error);
}