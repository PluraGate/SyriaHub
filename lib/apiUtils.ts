// API utilities for standardized responses and error handling
import { NextResponse } from 'next/server'
import type { PostgrestError } from '@supabase/supabase-js'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  requestId?: string
}

/**
 * Generate a unique request ID for tracing and debugging
 * Format: req_<timestamp_base36>_<random_9chars>
 * Example: req_lz5k8m2_a1b2c3d4e
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Add request ID header to a response
 */
export function withRequestId(response: NextResponse, requestId: string): NextResponse {
  response.headers.set('x-request-id', requestId)
  return response
}

/**
 * Create a successful JSON response
 */
export function successResponse<T>(data: T, status = 200, requestId?: string): NextResponse<ApiResponse<T>> {
  const response = NextResponse.json(
    {
      success: true,
      data,
      ...(requestId && { requestId }),
    },
    { status }
  )
  if (requestId) {
    response.headers.set('x-request-id', requestId)
  }
  return response
}

/**
 * Create an error JSON response
 */
export function errorResponse(
  message: string,
  status = 400,
  requestId?: string
): NextResponse<ApiResponse> {
  const response = NextResponse.json(
    {
      success: false,
      error: message,
      ...(requestId && { requestId }),
    },
    { status }
  )
  if (requestId) {
    response.headers.set('x-request-id', requestId)
  }
  return response
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
 * SECURITY: Validate and sanitize pagination parameters to prevent DoS attacks
 * Enforces maximum limits and ensures non-negative values
 */
export function sanitizePaginationParams(
  params: URLSearchParams,
  options: { maxLimit?: number; defaultLimit?: number } = {}
): { limit: number; offset: number } {
  const { maxLimit = 100, defaultLimit = 20 } = options

  let limit = parseInt(params.get('limit') || String(defaultLimit), 10)
  let offset = parseInt(params.get('offset') || '0', 10)

  // Ensure non-negative and within bounds
  limit = Math.max(1, Math.min(limit, maxLimit))
  offset = Math.max(0, offset)

  // Prevent extremely large offsets that could cause performance issues
  offset = Math.min(offset, 10000)

  return { limit, offset }
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
 * Wrap async route handler with error handling and request ID tracking
 */
export function withErrorHandling(
  handler: (request: Request, context?: any) => Promise<NextResponse>,
  options?: {
    cache?: {
      enabled?: boolean
      maxAge?: number
      staleWhileRevalidate?: number
      vary?: string[]
    }
  }
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    // Generate request ID for correlation
    const requestId = generateRequestId()

    try {
      const response = await handler(request, context)

      // Always add request ID to successful responses
      response.headers.set('x-request-id', requestId)

      const cacheOptions = options?.cache
      if (cacheOptions && cacheOptions.enabled !== false && request.method === 'GET') {
        if (!response.headers.has('Cache-Control')) {
          const maxAge = cacheOptions.maxAge ?? 60
          const stale = cacheOptions.staleWhileRevalidate ?? 300
          response.headers.set('Cache-Control', `s-maxage=${maxAge}, stale-while-revalidate=${stale}`)
        }

        const varyHeaders = cacheOptions.vary ?? ['Authorization', 'Cookie']
        if (varyHeaders.length > 0) {
          const existing = response.headers.get('Vary')
          const current = existing
            ? existing.split(',').map(header => header.trim()).filter(Boolean)
            : []
          const merged = Array.from(new Set([...current, ...varyHeaders]))
          response.headers.set('Vary', merged.join(', '))
        }
      }

      return response
    } catch (error) {
      // Log with request ID for correlation
      console.error(`[${requestId}] API Error:`, error)

      if (error instanceof Error) {
        // Handle specific error types
        if (error.message === 'Unauthorized') {
          return withRequestId(unauthorizedResponse(), requestId)
        }
        if (error.message.startsWith('Forbidden')) {
          return withRequestId(forbiddenResponse(error.message), requestId)
        }
        if (error.message.includes('not found')) {
          return withRequestId(notFoundResponse(), requestId)
        }

        return errorResponse(error.message, 400, requestId)
      }

      return errorResponse('An unexpected error occurred', 500, requestId)
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

/**
 * SECURITY: Validate request origin for CSRF protection
 * This should be used on all state-changing (mutation) endpoints that use cookie auth
 * 
 * @param request - The incoming request
 * @returns true if origin is valid, false otherwise
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Get allowed origins from environment
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://syriahub.com'
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null

  const allowedOrigins = [
    siteUrl,
    new URL(siteUrl).origin,
    'https://syriahub.org',
    'https://www.syriahub.org',
    'https://syriahub.com',
    'https://www.syriahub.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]

  if (vercelUrl) {
    allowedOrigins.push(vercelUrl)
  }

  // In development, be more permissive
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // Check origin header first (preferred)
  if (origin) {
    return allowedOrigins.some(allowed => origin === allowed || origin === new URL(allowed).origin)
  }

  // Fall back to referer header
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin
      return allowedOrigins.some(allowed => refererOrigin === allowed || refererOrigin === new URL(allowed).origin)
    } catch {
      return false
    }
  }

  // If no origin or referer, reject (could be a direct request from non-browser)
  // Exception: Some legitimate tools don't send origin, but we err on the side of security
  return false
}

/**
 * SECURITY: Middleware wrapper to validate origin on mutation endpoints
 * Use this on POST, PUT, PATCH, DELETE handlers that use cookie auth
 */
export function withOriginValidation<T extends any[]>(
  handler: (request: Request, ...args: T) => Promise<NextResponse>
) {
  return async (request: Request, ...args: T): Promise<NextResponse> => {
    // Only validate on mutation methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      if (!validateOrigin(request)) {
        return errorResponse('Invalid request origin', 403)
      }
    }
    return handler(request, ...args)
  }
}
