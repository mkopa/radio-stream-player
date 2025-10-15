/**
 * Radio Station Entity
 */

export interface RadioStation {
  id: number;
  changeuuid: string;
  stationuuid: string;
  serveruuid: string | null;
  name: string;
  url: string;
  url_resolved: string | null;
  homepage: string | null;
  favicon: string | null;
  country: string | null;
  countrycode: string | null;
  iso_3166_2: string | null;
  state: string | null;
  geo_lat: number | null;
  geo_long: number | null;
  language: string | null;
  languagecodes: string | null;
  tags: string | null;
  codec: string | null;
  bitrate: number | null;
  hls: number;
  ssl_error: number;
  votes: number;
  clickcount: number;
  clicktrend: number;
  lastcheckok: number;
  has_extended_info: number;
  lastchangetime: Date | null;
  lastchecktime: Date | null;
  lastcheckoktime: Date | null;
  lastlocalchecktime: Date | null;
  clicktimestamp: Date | null;
  created_at: Date;
  updated_at: Date;
}