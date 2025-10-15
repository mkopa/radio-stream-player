import { Service, Inject } from 'typedi';
import { IRadioStationRepository } from '../types/interfaces/IRadioStationRepository';
import {
  CreateRadioStationDto,
  UpdateRadioStationDto,
  RadioStationFilters,
} from '../types/dtos/radio-station.dto';
import { RadioStation } from '../types/entities/RadioStation.types';
import {
  RadioStationNotFoundError,
  RadioStationAlreadyExistsError,
} from '../types/errors/DomainErrors';
import logger from '../utils/logger';

/**
 * Radio Station Service
 * Handles radio station business logic
 */
@Service()
export class RadioStationService {
  constructor(
    @Inject('IRadioStationRepository')
    private readonly radioStationRepository: IRadioStationRepository
  ) {
    logger.debug('RadioStationService initialized with DI');
  }

  /**
   * Get all radio stations with filters and pagination
   */
  async getAllStations(
    filters: RadioStationFilters
  ): Promise<{ stations: RadioStation[]; total: number }> {
    logger.debug('Fetching radio stations with filters:', filters);

    const [stations, total] = await Promise.all([
      this.radioStationRepository.findAll(filters),
      this.radioStationRepository.count(filters),
    ]);

    logger.info(`✅ Retrieved ${stations.length} stations (total: ${total})`);

    return { stations, total };
  }

  /**
   * Get station by ID
   */
  async getStationById(id: number): Promise<RadioStation> {
    logger.debug(`Fetching station by ID: ${id}`);

    const station = await this.radioStationRepository.findById(id);

    if (!station) {
      throw new RadioStationNotFoundError(id);
    }

    return station;
  }

  /**
   * Search stations by query
   */
  async searchStations(query: string, limit: number): Promise<RadioStation[]> {
    logger.debug(`Searching stations with query: ${query}`);

    const stations = await this.radioStationRepository.search(query, limit);

    logger.info(`✅ Found ${stations.length} stations matching query`);

    return stations;
  }

  /**
   * Create new radio station
   */
  async createStation(data: CreateRadioStationDto): Promise<number> {
    logger.info(`Creating new station: ${data.name}`);

    // Check if station with same UUID already exists
    const existing = await this.radioStationRepository.findByStationUuid(data.stationuuid);

    if (existing) {
      throw new RadioStationAlreadyExistsError(data.stationuuid);
    }

    const stationId = await this.radioStationRepository.create(data);

    logger.info(`✅ Station created with ID: ${stationId}`);

    return stationId;
  }

  /**
   * Update radio station
   */
  async updateStation(id: number, data: UpdateRadioStationDto): Promise<void> {
    logger.info(`Updating station ID: ${id}`);

    // Check if station exists
    const station = await this.radioStationRepository.findById(id);

    if (!station) {
      throw new RadioStationNotFoundError(id);
    }

    const updated = await this.radioStationRepository.update(id, data);

    if (!updated) {
      throw new Error('Failed to update station');
    }

    logger.info(`✅ Station ${id} updated successfully`);
  }

  /**
   * Delete radio station
   */
  async deleteStation(id: number): Promise<void> {
    logger.info(`Deleting station ID: ${id}`);

    // Check if station exists
    const station = await this.radioStationRepository.findById(id);

    if (!station) {
      throw new RadioStationNotFoundError(id);
    }

    const deleted = await this.radioStationRepository.delete(id);

    if (!deleted) {
      throw new Error('Failed to delete station');
    }

    logger.info(`✅ Station ${id} deleted successfully`);
  }
}