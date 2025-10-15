import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { RadioStationService } from '../services/RadioStationService';
import { CreateRadioStationDto, UpdateRadioStationDto } from '../types/dtos/radio-station.dto';
import {
  RadioStationListResponse,
  RadioStationResponse,
  RadioStationCreateResponse,
  RadioStationUpdateResponse,
  RadioStationDeleteResponse,
} from '../types/responses/radio-station.response';
import logger from '../utils/logger';

/**
 * Radio Station Controller
 * Handles HTTP requests for radio station CRUD operations
 */
@Service()
export class RadioStationController {
  constructor(private readonly radioStationService: RadioStationService) {
    logger.debug('RadioStationController initialized with DI');
  }

  /**
   * GET /stations
   * Get all radio stations with filters and pagination
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching radio stations');

      const filters = {
        name: req.query.name as string,
        country: req.query.country as string,
        countrycode: req.query.countrycode as string,
        state: req.query.state as string,
        codec: req.query.codec as string,
        tags: req.query.tags as string,
        minVotes: req.query.minVotes ? Number(req.query.minVotes) : undefined,
        lastcheckok: req.query.lastcheckok === 'true' ? true : undefined,
        limit: req.query.limit ? Number(req.query.limit) : 50,
        offset: req.query.offset ? Number(req.query.offset) : 0,
      };

      const { stations, total } = await this.radioStationService.getAllStations(filters);

      const response: RadioStationListResponse = {
        stations,
        total,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      };

      res.status(200).json(response);
      logger.info(`✅ Retrieved ${stations.length} stations`);
    } catch (err) {
      logger.error('❌ Get stations error:', err);
      next(err);
    }
  }

  /**
   * GET /stations/search
   * Search stations by query
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? Number(req.query.limit) : 50;

      if (!query) {
        res.status(400).json({ error: 'Search query (q) is required' });
        return;
      }

      logger.info(`Searching stations with query: ${query}`);

      const stations = await this.radioStationService.searchStations(query, limit);

      const response: RadioStationListResponse = {
        stations,
        total: stations.length,
        limit,
        offset: 0,
      };

      res.status(200).json(response);
      logger.info(`✅ Found ${stations.length} stations`);
    } catch (err) {
      logger.error('❌ Search stations error:', err);
      next(err);
    }
  }

  /**
   * GET /stations/:id
   * Get station by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid station ID' });
        return;
      }

      logger.info(`Fetching station by ID: ${id}`);

      const station = await this.radioStationService.getStationById(id);

      const response: RadioStationResponse = { station };

      res.status(200).json(response);
      logger.info(`✅ Retrieved station ${id}`);
    } catch (err) {
      logger.error('❌ Get station error:', err);
      next(err);
    }
  }

  /**
   * POST /stations
   * Create new radio station
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateRadioStationDto = req.body;

      logger.info(`Creating station: ${data.name}`);

      const stationId = await this.radioStationService.createStation(data);

      const response: RadioStationCreateResponse = {
        message: 'Radio station created successfully',
        stationId,
        stationuuid: data.stationuuid,
      };

      res.status(201).json(response);
      logger.info(`✅ Station created with ID: ${stationId}`);
    } catch (err) {
      logger.error('❌ Create station error:', err);
      next(err);
    }
  }

  /**
   * PUT /stations/:id
   * Update radio station
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid station ID' });
        return;
      }

      const data: UpdateRadioStationDto = req.body;

      logger.info(`Updating station ID: ${id}`);

      await this.radioStationService.updateStation(id, data);

      const response: RadioStationUpdateResponse = {
        message: 'Radio station updated successfully',
        stationId: id,
      };

      res.status(200).json(response);
      logger.info(`✅ Station ${id} updated successfully`);
    } catch (err) {
      logger.error('❌ Update station error:', err);
      next(err);
    }
  }

  /**
   * DELETE /stations/:id
   * Delete radio station
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid station ID' });
        return;
      }

      logger.info(`Deleting station ID: ${id}`);

      await this.radioStationService.deleteStation(id);

      const response: RadioStationDeleteResponse = {
        message: 'Radio station deleted successfully',
        stationId: id,
      };

      res.status(200).json(response);
      logger.info(`✅ Station ${id} deleted successfully`);
    } catch (err) {
      logger.error('❌ Delete station error:', err);
      next(err);
    }
  }
}