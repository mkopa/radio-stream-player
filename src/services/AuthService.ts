import { Service, Inject } from 'typedi';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUserRepository } from '../types/interfaces/IUserRepository';
import { LoginDto, LoginResponse, JwtPayload } from '../types/dtos/auth.dto';
import {
  InvalidCredentialsError,
  AccountNotActivatedError,
  UserNotFoundError,
} from '../types/errors/DomainErrors';
import { verifyPassword } from '../utils/crypto';
import type { StringValue } from "ms";
import logger from '../utils/logger';


/**
 * Authentication Service
 * Handles user login and JWT token generation
 */
@Service()
export class AuthService {
  constructor(@Inject('IUserRepository') private readonly userRepository: IUserRepository) {
    logger.debug('AuthService initialized with DI');
  }

  /**
   * Authenticate user and generate JWT token
   *
   * @param data - Login credentials (email, password)
   * @returns JWT token and user info
   * @throws {InvalidCredentialsError} If email or password is incorrect
   * @throws {AccountNotActivatedError} If user hasn't set password yet
   */
  async login(data: LoginDto): Promise<LoginResponse> {
    logger.info(`Login attempt for email: ${data.email}`);

    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      logger.warn(`Login failed: user not found - ${data.email}`);
      throw new InvalidCredentialsError();
    }

    // Check if user has set password
    if (!user.has_password || !user.password_hash) {
      logger.warn(`Login failed: account not activated - ${data.email}`);
      throw new AccountNotActivatedError();
    }

    // Verify password
    const isValidPassword = await verifyPassword(user.password_hash, data.password);

    if (!isValidPassword) {
      logger.warn(`Login failed: invalid password - ${data.email}`);
      throw new InvalidCredentialsError();
    }

    // Check if user is active
    if (!user.is_active) {
      logger.warn(`Login failed: account not active - ${data.email}`);
      throw new AccountNotActivatedError();
    }

    // Generate JWT token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // const token = jwt.sign(payload, secret, {
    //   expiresIn: process.env.JWT_EXPIRY || '24h',
    // });
    const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRY || '24h') as StringValue };
    const token = jwt.sign(payload, secret, options);

    logger.info(`✅ Login successful for user: ${data.email}`);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  /**
   * Verify JWT token and extract payload
   *
   * @param token - JWT token
   * @returns Decoded JWT payload
   * @throws {UnauthorizedError} If token is invalid or expired
   */
  verifyToken(token: string): JwtPayload {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return decoded;
    } catch (error) {
      logger.warn('Token verification failed:', error);
      throw new Error('Invalid or expired token');
    }
  }
}