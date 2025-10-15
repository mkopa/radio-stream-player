import { Service, Inject } from 'typedi';
import { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository } from './base/BaseRepository';
import { IRadioStationRepository } from '../types/interfaces/IRadioStationRepository';
import { RadioStation } from '../types/entities/RadioStation.types';
import {
  CreateRadioStationDto,
  UpdateRadioStationDto,
  RadioStationFilters,
} from '../types/dtos/radio-station.dto';

/**
 * Radio Station Repository Implementation
 * Handles all radio station database operations
 */
@Service()
export class RadioStationRepository extends BaseRepository implements IRadioStationRepository {
  constructor(@Inject('DB_POOL') private readonly pool: Pool) {
    super();
  }

  /**
   * Find all radio stations with optional filters
   */
  async findAll(filters: RadioStationFilters, conn?: PoolConnection): Promise<RadioStation[]> {
    const client = conn || this.pool;
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.name) {
      conditions.push('name LIKE ?');
      values.push(`%${filters.name}%`);
    }

    if (filters.country) {
      conditions.push('country LIKE ?');
      values.push(`%${filters.country}%`);
    }

    if (filters.countrycode) {
      conditions.push('countrycode = ?');
      values.push(filters.countrycode);
    }

    if (filters.state) {
      conditions.push('state LIKE ?');
      values.push(`%${filters.state}%`);
    }

    if (filters.codec) {
      conditions.push('codec = ?');
      values.push(filters.codec);
    }

    if (filters.tags) {
      conditions.push('tags LIKE ?');
      values.push(`%${filters.tags}%`);
    }

    if (filters.minVotes !== undefined) {
      conditions.push('votes >= ?');
      values.push(filters.minVotes);
    }

    if (filters.lastcheckok !== undefined) {
      conditions.push('lastcheckok = ?');
      values.push(filters.lastcheckok ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const sql = `
      SELECT * FROM radio_stations
      ${whereClause}
      ORDER BY votes DESC, clickcount DESC
      LIMIT ? OFFSET ?
    `;

    values.push(limit, offset);

    const [rows] = await client.query<RowDataPacket[]>(sql, values);
    return rows as RadioStation[];
  }

  /**
   * Count stations with filters
   */
  async count(filters: RadioStationFilters, conn?: PoolConnection): Promise<number> {
    const client = conn || this.pool;
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.name) {
      conditions.push('name LIKE ?');
      values.push(`%${filters.name}%`);
    }

    if (filters.country) {
      conditions.push('country LIKE ?');
      values.push(`%${filters.country}%`);
    }

    if (filters.countrycode) {
      conditions.push('countrycode = ?');
      values.push(filters.countrycode);
    }

    if (filters.state) {
      conditions.push('state LIKE ?');
      values.push(`%${filters.state}%`);
    }

    if (filters.codec) {
      conditions.push('codec = ?');
      values.push(filters.codec);
    }

    if (filters.tags) {
      conditions.push('tags LIKE ?');
      values.push(`%${filters.tags}%`);
    }

    if (filters.minVotes !== undefined) {
      conditions.push('votes >= ?');
      values.push(filters.minVotes);
    }

    if (filters.lastcheckok !== undefined) {
      conditions.push('lastcheckok = ?');
      values.push(filters.lastcheckok ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await client.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM radio_stations ${whereClause}`,
      values
    );

    return (rows[0] as { count: number }).count;
  }

  /**
   * Find station by ID
   */
  async findById(id: number, conn?: PoolConnection): Promise<RadioStation | null> {
    const client = conn || this.pool;
    const [rows] = await client.query<RowDataPacket[]>(
      'SELECT * FROM radio_stations WHERE id = ?',
      [id]
    );
    return (rows[0] as RadioStation) || null;
  }

  /**
   * Find station by UUID
   */
  async findByStationUuid(
    stationuuid: string,
    conn?: PoolConnection
  ): Promise<RadioStation | null> {
    const client = conn || this.pool;
    const [rows] = await client.query<RowDataPacket[]>(
      'SELECT * FROM radio_stations WHERE stationuuid = ?',
      [stationuuid]
    );
    return (rows[0] as RadioStation) || null;
  }

  /**
   * Search stations by name or tags (fulltext search)
   */
  async search(query: string, limit: number, conn?: PoolConnection): Promise<RadioStation[]> {
    const client = conn || this.pool;
    const [rows] = await client.query<RowDataPacket[]>(
      `SELECT *, MATCH(name, tags, country, state) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
       FROM radio_stations
       WHERE MATCH(name, tags, country, state) AGAINST(? IN NATURAL LANGUAGE MODE)
       ORDER BY relevance DESC, votes DESC
       LIMIT ?`,
      [query, query, limit]
    );
    return rows as RadioStation[];
  }

  /**
   * Create new radio station
   */
  async create(data: CreateRadioStationDto, conn?: PoolConnection): Promise<number> {
    const client = conn || this.pool;

    const [result] = await client.query<ResultSetHeader>(
      `INSERT INTO radio_stations (
        changeuuid, stationuuid, serveruuid, name, url, url_resolved, homepage, favicon,
        country, countrycode, iso_3166_2, state, geo_lat, geo_long,
        language, languagecodes, tags, codec, bitrate, hls, ssl_error,
        votes, clickcount, clicktrend, lastcheckok, has_extended_info,
        lastchangetime, lastchecktime, lastcheckoktime, lastlocalchecktime, clicktimestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.changeuuid,
        data.stationuuid,
        data.serveruuid || null,
        data.name,
        data.url,
        data.url_resolved || null,
        data.homepage || null,
        data.favicon || null,
        data.country || null,
        data.countrycode || null,
        data.iso_3166_2 || null,
        data.state || null,
        data.geo_lat || null,
        data.geo_long || null,
        data.language || null,
        data.languagecodes || null,
        data.tags || null,
        data.codec || null,
        data.bitrate || null,
        data.hls ? 1 : 0,
        data.ssl_error ? 1 : 0,
        data.votes || 0,
        data.clickcount || 0,
        data.clicktrend || 0,
        data.lastcheckok ? 1 : 0,
        data.has_extended_info ? 1 : 0,
        data.lastchangetime || null,
        data.lastchecktime || null,
        data.lastcheckoktime || null,
        data.lastlocalchecktime || null,
        data.clicktimestamp || null,
      ]
    );

    return result.insertId;
  }

  /**
   * Update radio station
   */
  async update(id: number, data: UpdateRadioStationDto, conn?: PoolConnection): Promise<boolean> {
    const client = conn || this.pool;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.changeuuid !== undefined) {
      updates.push('changeuuid = ?');
      values.push(data.changeuuid);
    }
    if (data.serveruuid !== undefined) {
      updates.push('serveruuid = ?');
      values.push(data.serveruuid);
    }
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.url !== undefined) {
      updates.push('url = ?');
      values.push(data.url);
    }
    if (data.url_resolved !== undefined) {
      updates.push('url_resolved = ?');
      values.push(data.url_resolved);
    }
    if (data.homepage !== undefined) {
      updates.push('homepage = ?');
      values.push(data.homepage);
    }
    if (data.favicon !== undefined) {
      updates.push('favicon = ?');
      values.push(data.favicon);
    }
    if (data.country !== undefined) {
      updates.push('country = ?');
      values.push(data.country);
    }
    if (data.countrycode !== undefined) {
      updates.push('countrycode = ?');
      values.push(data.countrycode);
    }
    if (data.iso_3166_2 !== undefined) {
      updates.push('iso_3166_2 = ?');
      values.push(data.iso_3166_2);
    }
    if (data.state !== undefined) {
      updates.push('state = ?');
      values.push(data.state);
    }
    if (data.geo_lat !== undefined) {
      updates.push('geo_lat = ?');
      values.push(data.geo_lat);
    }
    if (data.geo_long !== undefined) {
      updates.push('geo_long = ?');
      values.push(data.geo_long);
    }
    if (data.language !== undefined) {
      updates.push('language = ?');
      values.push(data.language);
    }
    if (data.languagecodes !== undefined) {
      updates.push('languagecodes = ?');
      values.push(data.languagecodes);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(data.tags);
    }
    if (data.codec !== undefined) {
      updates.push('codec = ?');
      values.push(data.codec);
    }
    if (data.bitrate !== undefined) {
      updates.push('bitrate = ?');
      values.push(data.bitrate);
    }
    if (data.hls !== undefined) {
      updates.push('hls = ?');
      values.push(data.hls ? 1 : 0);
    }
    if (data.ssl_error !== undefined) {
      updates.push('ssl_error = ?');
      values.push(data.ssl_error ? 1 : 0);
    }
    if (data.votes !== undefined) {
      updates.push('votes = ?');
      values.push(data.votes);
    }
    if (data.clickcount !== undefined) {
      updates.push('clickcount = ?');
      values.push(data.clickcount);
    }
    if (data.clicktrend !== undefined) {
      updates.push('clicktrend = ?');
      values.push(data.clicktrend);
    }
    if (data.lastcheckok !== undefined) {
      updates.push('lastcheckok = ?');
      values.push(data.lastcheckok ? 1 : 0);
    }
    if (data.has_extended_info !== undefined) {
      updates.push('has_extended_info = ?');
      values.push(data.has_extended_info ? 1 : 0);
    }
    if (data.lastchangetime !== undefined) {
      updates.push('lastchangetime = ?');
      values.push(data.lastchangetime);
    }
    if (data.lastchecktime !== undefined) {
      updates.push('lastchecktime = ?');
      values.push(data.lastchecktime);
    }
    if (data.lastcheckoktime !== undefined) {
      updates.push('lastcheckoktime = ?');
      values.push(data.lastcheckoktime);
    }
    if (data.lastlocalchecktime !== undefined) {
      updates.push('lastlocalchecktime = ?');
      values.push(data.lastlocalchecktime);
    }
    if (data.clicktimestamp !== undefined) {
      updates.push('clicktimestamp = ?');
      values.push(data.clicktimestamp);
    }

    if (updates.length === 0) {
      return false;
    }

    values.push(id);

    const [result] = await client.query<ResultSetHeader>(
      `UPDATE radio_stations SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Delete radio station
   */
  async delete(id: number, conn?: PoolConnection): Promise<boolean> {
    const client = conn || this.pool;
    const [result] = await client.query<ResultSetHeader>(
      'DELETE FROM radio_stations WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get database connection
   */
  async getConnection(): Promise<PoolConnection> {
    return await this.pool.getConnection();
  }
}