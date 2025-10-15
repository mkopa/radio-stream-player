/**
 * Domain-specific errors with HTTP status codes
 * Used for business logic error handling
 */

export interface DomainError extends Error {
  statusCode: number;
  errorCode: string;
}

export function isDomainError(error: unknown): error is DomainError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'errorCode' in error &&
    'message' in error
  );
}

// ==========================================
// User Errors
// ==========================================

export class UserAlreadyExistsError extends Error implements DomainError {
  statusCode = 409;
  errorCode = 'USER_ALREADY_EXISTS';

  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class UserNotFoundError extends Error implements DomainError {
  statusCode = 404;
  errorCode = 'USER_NOT_FOUND';

  constructor(identifier: string | number) {
    super(`User with identifier ${identifier} not found`);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidCredentialsError extends Error implements DomainError {
  statusCode = 401;
  errorCode = 'INVALID_CREDENTIALS';

  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class AccountNotActivatedError extends Error implements DomainError {
  statusCode = 403;
  errorCode = 'ACCOUNT_NOT_ACTIVATED';

  constructor() {
    super('Account is not activated. Please set your password first.');
    this.name = 'AccountNotActivatedError';
  }
}

// ==========================================
// Company Errors
// ==========================================

export class CompanyNotFoundError extends Error implements DomainError {
  statusCode = 404;
  errorCode = 'COMPANY_NOT_FOUND';

  constructor(companyId: number) {
    super(`Company with ID ${companyId} not found`);
    this.name = 'CompanyNotFoundError';
  }
}

// ==========================================
// Token Errors
// ==========================================

export class InvalidTokenError extends Error implements DomainError {
  statusCode = 404;
  errorCode = 'INVALID_TOKEN';

  constructor() {
    super('Invalid or already used token');
    this.name = 'InvalidTokenError';
  }
}

export class TokenExpiredError extends Error implements DomainError {
  statusCode = 410;
  errorCode = 'TOKEN_EXPIRED';

  constructor() {
    super('Token has expired');
    this.name = 'TokenExpiredError';
  }
}

// ==========================================
// Password Errors
// ==========================================

export class WeakPasswordError extends Error implements DomainError {
  statusCode = 400;
  errorCode = 'WEAK_PASSWORD';

  constructor(details: string) {
    super(`Password does not meet requirements: ${details}`);
    this.name = 'WeakPasswordError';
  }
}

// ==========================================
// Radio Station Errors
// ==========================================

export class RadioStationNotFoundError extends Error implements DomainError {
  statusCode = 404;
  errorCode = 'RADIO_STATION_NOT_FOUND';

  constructor(identifier: string | number) {
    super(`Radio station with identifier ${identifier} not found`);
    this.name = 'RadioStationNotFoundError';
  }
}

export class RadioStationAlreadyExistsError extends Error implements DomainError {
  statusCode = 409;
  errorCode = 'RADIO_STATION_ALREADY_EXISTS';

  constructor(stationuuid: string) {
    super(`Radio station with UUID ${stationuuid} already exists`);
    this.name = 'RadioStationAlreadyExistsError';
  }
}

// ==========================================
// Authentication Errors
// ==========================================

export class UnauthorizedError extends Error implements DomainError {
  statusCode = 401;
  errorCode = 'UNAUTHORIZED';

  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error implements DomainError {
  statusCode = 403;
  errorCode = 'FORBIDDEN';

  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}