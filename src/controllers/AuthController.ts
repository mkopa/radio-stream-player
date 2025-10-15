import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { LoginDto, LoginResponse } from '../types/dtos/auth.dto';
import logger from '../utils/logger';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */
@Service()
export class AuthController {
  constructor(private readonly authService: AuthService) {
    logger.debug('AuthController initialized with DI');
  }

  /**
   * POST /login
   * Authenticate user and return JWT token
   *
   * Request body:
   * - email: string (required)
   * - password: string (required)
   *
   * Success (200):
   * { token: "...", user: { id, email, first_name, last_name } }
   *
   * Errors:
   * - 400: Validation error
   * - 401: Invalid credentials
   * - 403: Account not activated
   * - 500: Internal server error
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginDto = req.body;

      logger.info(`Login request for email: ${data.email}`);

      const result: LoginResponse = await this.authService.login(data);

      res.status(200).json(result);
      logger.info(`✅ Login successful: ${data.email}`);
    } catch (err) {
      logger.error('❌ Login controller error:', err);
      next(err);
    }
  }
}