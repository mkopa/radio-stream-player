import { PoolConnection } from 'mysql2/promise';
import { RadioStation } from '../entities/RadioStation.types';
import { CreateRadioStationDto, UpdateRadioStationDto, RadioStationFilters } from '../dtos/radio-station.dto';

/**
 * Radio Station Repository Interface
 */
export interface IRadioStationRepository {
  findAll(filters: RadioStationFilters, conn?: PoolConnection): Promise<RadioStation[]>;
  findById(id: number, conn?: PoolConnection): Promise<RadioStation | null>;
  findByStationUuid(stationuuid: string, conn?: PoolConnection): Promise<RadioStation | null>;
  create(data: CreateRadioStationDto, conn?: PoolConnection): Promise<number>;
  update(id: number, data: UpdateRadioStationDto, conn?: PoolConnection): Promise<boolean>;
  delete(id: number, conn?: PoolConnection): Promise<boolean>;
  count(filters: RadioStationFilters, conn?: PoolConnection): Promise<number>;
  search(query: string, limit: number, conn?: PoolConnection): Promise<RadioStation[]>;
  getConnection(): Promise<PoolConnection>;
}