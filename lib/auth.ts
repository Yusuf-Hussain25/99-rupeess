import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function authenticateRequest(request: NextRequest): {
  user: JWTPayload | null;
  error: string | null;
} {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      user: null,
      error: 'No token provided',
    };
  }

  try {
    const user = verifyToken(token);
    return {
      user,
      error: null,
    };
  } catch (error: any) {
    return {
      user: null,
      error: error.message || 'Invalid token',
    };
  }
}

export function requireAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const { user, error } = authenticateRequest(request);

    if (!user || error) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

export function requireAdmin<T = any>(
  handler: (request: NextRequest, context: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: T) => {
    const { user, error } = authenticateRequest(request);

    if (!user || error) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return handler(request, context);
  };
}


