import { RadioStation } from '../entities/RadioStation.types';

/**
 * Radio Station API Responses
 */

export interface RadioStationListResponse {
  stations: RadioStation[];
  total: number;
  limit: number;
  offset: number;
}

export interface RadioStationResponse {
  station: RadioStation;
}

export interface RadioStationCreateResponse {
  message: string;
  stationId: number;
  stationuuid: string;
}

export interface RadioStationUpdateResponse {
  message: string;
  stationId: number;
}

export interface RadioStationDeleteResponse {
  message: string;
  stationId: number;
}