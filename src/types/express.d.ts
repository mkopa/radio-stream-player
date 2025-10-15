import { JwtPayload } from './dtos/auth.dto';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

export {};