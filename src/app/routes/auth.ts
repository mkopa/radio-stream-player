import { Router, Request, Response } from 'express';
import { Container } from 'typedi';
import { validateSchema } from '../middlewares/ajvValidator';
import loginSchema from '../../validation/schemas/login.schema.json';
import { AuthController } from '../../controllers/AuthController';

/**
 * Authentication routes
 * Public endpoints for user authentication
 */
export function authRouter(): Router {
  const router = Router();

  // Get controller instance from DI container
  const controller = Container.get(AuthController);

  /**
   * POST /login
   * Authenticate user and return JWT token
   */
  router.post('/login', validateSchema(loginSchema), controller.login.bind(controller));

  return router;
}