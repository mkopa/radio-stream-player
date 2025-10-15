import { Router } from 'express';
import { Container } from 'typedi';
import { validateSchema } from '../middlewares/ajvValidator';
import createStationSchema from '../../validation/schemas/create-radio-station.schema.json';
import updateStationSchema from '../../validation/schemas/update-radio-station.schema.json';
import { RadioStationController } from '../../controllers/RadioStationController';
import { jwtAuth } from '../middlewares/jwtAuth';

/**
 * Radio Station routes
 * Protected by JWT authentication
 */
export function stationsRouter(): Router {
  const router = Router();

  // Get controller instance from DI container
  const controller = Container.get(RadioStationController);

  // Apply JWT auth to all routes
  router.use(jwtAuth);

  /**
   * GET /stations
   * Get all stations with filters
   */
  router.get('/', controller.getAll.bind(controller));

  /**
   * GET /stations/search
   * Search stations by query
   */
  router.get('/search', controller.search.bind(controller));

  /**
   * GET /stations/:id
   * Get station by ID
   */
  router.get('/:id', controller.getById.bind(controller));

  /**
   * POST /stations
   * Create new station
   */
  router.post('/', validateSchema(createStationSchema), controller.create.bind(controller));

  /**
   * PUT /stations/:id
   * Update station
   */
  router.put('/:id', validateSchema(updateStationSchema), controller.update.bind(controller));

  /**
   * DELETE /stations/:id
   * Delete station
   */
  router.delete('/:id', controller.delete.bind(controller));

  return router;
}