-- migrations/004_create_radio_stations.sql
-- Radio Stations Database Schema
-- Stores metadata about radio stations from radio-browser.info API

USE boarding;

CREATE TABLE IF NOT EXISTS radio_stations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  
  -- UUID identifiers
  changeuuid CHAR(36) NOT NULL COMMENT 'Change UUID from API',
  stationuuid CHAR(36) NOT NULL UNIQUE COMMENT 'Station UUID (unique identifier)',
  serveruuid CHAR(36) COMMENT 'Server UUID',
  
  -- Basic information
  name VARCHAR(500) NOT NULL COMMENT 'Station name',
  url TEXT NOT NULL COMMENT 'Stream URL',
  url_resolved TEXT COMMENT 'Resolved stream URL',
  homepage TEXT COMMENT 'Station homepage URL',
  favicon TEXT COMMENT 'Station favicon URL',
  
  -- Location data
  country VARCHAR(255) COMMENT 'Full country name',
  countrycode CHAR(2) COMMENT 'ISO 3166-1 alpha-2 country code',
  iso_3166_2 VARCHAR(20) COMMENT 'ISO 3166-2 subdivision code',
  state VARCHAR(255) COMMENT 'State/region name',
  
  -- Geolocation
  geo_lat DECIMAL(10, 8) COMMENT 'Latitude',
  geo_long DECIMAL(11, 8) COMMENT 'Longitude',
  
  -- Language and tags
  language VARCHAR(500) COMMENT 'Language names (comma-separated)',
  languagecodes VARCHAR(500) COMMENT 'ISO language codes (comma-separated)',
  tags TEXT COMMENT 'Tags/genres (comma-separated)',
  
  -- Technical details
  codec VARCHAR(50) COMMENT 'Audio codec (MP3, AAC, etc.)',
  bitrate INT UNSIGNED COMMENT 'Bitrate in kbps',
  hls TINYINT(1) DEFAULT 0 COMMENT 'HLS stream flag',
  ssl_error TINYINT(1) DEFAULT 0 COMMENT 'SSL error flag',
  
  -- Popularity metrics
  votes INT UNSIGNED DEFAULT 0 COMMENT 'User votes count',
  clickcount INT UNSIGNED DEFAULT 0 COMMENT 'Click count',
  clicktrend INT DEFAULT 0 COMMENT 'Click trend',
  
  -- Status flags
  lastcheckok TINYINT(1) DEFAULT 0 COMMENT 'Last check status (1=OK, 0=Failed)',
  has_extended_info TINYINT(1) DEFAULT 0 COMMENT 'Extended info available flag',
  
  -- Timestamps
  lastchangetime TIMESTAMP NULL COMMENT 'Last change timestamp',
  lastchecktime TIMESTAMP NULL COMMENT 'Last check timestamp',
  lastcheckoktime TIMESTAMP NULL COMMENT 'Last successful check timestamp',
  lastlocalchecktime TIMESTAMP NULL COMMENT 'Last local check timestamp',
  clicktimestamp TIMESTAMP NULL COMMENT 'Last click timestamp',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time',
  
  -- Indexes for common queries
  INDEX idx_stationuuid (stationuuid),
  INDEX idx_name (name(255)),
  INDEX idx_country (country(100)),
  INDEX idx_countrycode (countrycode),
  INDEX idx_state (state(100)),
  INDEX idx_codec (codec),
  INDEX idx_votes (votes),
  INDEX idx_lastcheckok (lastcheckok),
  INDEX idx_clickcount (clickcount),
  INDEX idx_geo (geo_lat, geo_long),
  FULLTEXT INDEX idx_tags (tags),
  FULLTEXT INDEX idx_search (name, tags, country, state)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Radio stations metadata';

-- Create table for station favorites (many-to-many with users)
CREATE TABLE IF NOT EXISTS user_favorite_stations (
  user_id BIGINT NOT NULL,
  station_id BIGINT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (user_id, station_id),
  CONSTRAINT fk_ufs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ufs_station FOREIGN KEY (station_id) REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_station_id (station_id),
  INDEX idx_added_at (added_at)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User favorite radio stations';

-- Create table for station listening history
CREATE TABLE IF NOT EXISTS station_listen_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  station_id BIGINT NOT NULL,
  listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_seconds INT UNSIGNED COMMENT 'Listen duration in seconds',
  
  CONSTRAINT fk_slh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_slh_station FOREIGN KEY (station_id) REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_station_id (station_id),
  INDEX idx_listened_at (listened_at)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User listening history';

-- Analyze tables for optimization
ANALYZE TABLE radio_stations, user_favorite_stations, station_listen_history;
