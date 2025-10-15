/**
 * Radio Station DTOs
 */

export interface CreateRadioStationDto {
  changeuuid: string;
  stationuuid: string;
  serveruuid?: string;
  name: string;
  url: string;
  url_resolved?: string;
  homepage?: string;
  favicon?: string;
  country?: string;
  countrycode?: string;
  iso_3166_2?: string;
  state?: string;
  geo_lat?: number;
  geo_long?: number;
  language?: string;
  languagecodes?: string;
  tags?: string;
  codec?: string;
  bitrate?: number;
  hls?: boolean;
  ssl_error?: boolean;
  votes?: number;
  clickcount?: number;
  clicktrend?: number;
  lastcheckok?: boolean;
  has_extended_info?: boolean;
  lastchangetime?: Date;
  lastchecktime?: Date;
  lastcheckoktime?: Date;
  lastlocalchecktime?: Date;
  clicktimestamp?: Date;
}

export interface UpdateRadioStationDto {
  changeuuid?: string;
  serveruuid?: string;
  name?: string;
  url?: string;
  url_resolved?: string;
  homepage?: string;
  favicon?: string;
  country?: string;
  countrycode?: string;
  iso_3166_2?: string;
  state?: string;
  geo_lat?: number;
  geo_long?: number;
  language?: string;
  languagecodes?: string;
  tags?: string;
  codec?: string;
  bitrate?: number;
  hls?: boolean;
  ssl_error?: boolean;
  votes?: number;
  clickcount?: number;
  clicktrend?: number;
  lastcheckok?: boolean;
  has_extended_info?: boolean;
  lastchangetime?: Date;
  lastchecktime?: Date;
  lastcheckoktime?: Date;
  lastlocalchecktime?: Date;
  clicktimestamp?: Date;
}

export interface RadioStationFilters {
  name?: string;
  country?: string;
  countrycode?: string;
  state?: string;
  codec?: string;
  tags?: string;
  minVotes?: number;
  lastcheckok?: boolean;
  limit?: number;
  offset?: number;
}