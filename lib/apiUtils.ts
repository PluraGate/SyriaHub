// API utilities for standardized responses and error handling
import { NextResponse } from 'next/server'
import type { PostgrestError } from '@supabase/supabase-js'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Create a successful JSON response
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

/**
 * Create an error JSON response
 */
export function errorResponse(
  message: string,
  status = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  )
}

/**
 * Handle Supabase/Postgres errors
 */
export function handleSupabaseError(error: PostgrestError | Error | null): NextResponse<ApiResponse> {
  if (!error) {
    return errorResponse('An unknown error occurred', 500)
  }

  // Check if it's a PostgrestError
  if ('code' in error) {
    const pgError = error as PostgrestError
    
    // Map common Postgres error codes to user-friendly messages
    switch (pgError.code) {
      case '23505': // unique_violation
        return errorResponse('A record with this information already exists', 409)
      case '23503': // foreign_key_violation
        return errorResponse('Referenced record does not exist', 400)
      case '23502': // not_null_violation
        return errorResponse('Required field is missing', 400)
      case 'PGRST116': // No rows found
        return errorResponse('Record not found', 404)
      case '42501': // insufficient_privilege
        return errorResponse('Insufficient permissions', 403)
      default:
        return errorResponse(pgError.message || 'Database error occurred', 500)
    }
  }

  // Handle regular errors
  return errorResponse(error.message || 'An error occurred', 500)
}

/**
 * Handle authentication errors
 */
export function unauthorizedResponse(message = 'Authentication required'): NextResponse<ApiResponse> {
  return errorResponse(message, 401)
}

/**
 * Handle authorization errors
 */
export function forbiddenResponse(message = 'Insufficient permissions'): NextResponse<ApiResponse> {
  return errorResponse(message, 403)
}

/**
 * Handle not found errors
 */
export function notFoundResponse(message = 'Resource not found'): NextResponse<ApiResponse> {
  return errorResponse(message, 404)
}

/**
 * Handle validation errors
 */
export function validationErrorResponse(message: string): NextResponse<ApiResponse> {
  return errorResponse(message, 422)
}

/**
 * Parse and validate request body
 */
export async function parseRequestBody<T>(request: Request): Promise<T> {
  try {
    const body = await request.json()
    return body as T
  } catch {
    throw new Error('Invalid JSON in request body')
  }
}

/**
 * Get query parameters from URL
 */
export function getQueryParams(request: Request): URLSearchParams {
  const { searchParams } = new URL(request.url)
  return searchParams
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missing = requiredFields.filter(field => !data[field])
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandling(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', error)
      
      if (error instanceof Error) {
        // Handle specific error types
        if (error.message === 'Unauthorized') {
          return unauthorizedResponse()
        }
        if (error.message.startsWith('Forbidden')) {
          return forbiddenResponse(error.message)
        }
        if (error.message.includes('not found')) {
          return notFoundResponse()
        }
        
        return errorResponse(error.message)
      }
      
      return errorResponse('An unexpected error occurred', 500)
    }
  }
}

/**
 * Extract user ID from path parameters
 */
export function extractIdFromParams(params: any): string {
  const id = params?.id
  
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid or missing ID parameter')
  }
  
  return id
}
