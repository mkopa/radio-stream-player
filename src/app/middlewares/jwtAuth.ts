import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../../types/dtos/auth.dto';
import { UnauthorizedError } from '../../types/errors/DomainErrors';
import logger from '../../utils/logger';

/**
 * JWT Authentication Middleware
 * Verifies Bearer token and attaches user info to request
 */
export function jwtAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Verify token
    const decoded = jwt.verify(token, secret, {ignoreExpiration: false}) as JwtPayload;

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    logger.debug(`JWT Auth successful for user: ${decoded.email}`);

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('JWT verification failed:', error.message);
      return next(new UnauthorizedError('Invalid or expired token'));
    }

    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('JWT token expired');
      return next(new UnauthorizedError('Token has expired'));
    }

    next(error);
  }
}