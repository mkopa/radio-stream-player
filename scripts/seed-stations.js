#!/usr/bin/env node

/**
 * Radio Stations Seed Script
 * Clears radio_stations table and imports data from stations.json
 *
 * Usage (from project root):
 *   node scripts/seed-stations.js
 *
 * Usage (from Docker container):
 *   docker cp stations.json boarding-system-app-1:/usr/src/app/stations.json
 *   docker exec -it boarding-system-app-1 node scripts/seed-stations.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Try to load .env if it exists, but don't fail if it doesn't (for Docker)
try {
  require('dotenv/config');
} catch (e) {
  console.log('ℹ️  Running without .env file (using environment variables)');
}

// Configuration
const STATIONS_FILE = path.join(__dirname, '..', 'stations.json');
const BATCH_SIZE = 100; // Insert in batches for better performance

// Parse ISO8601 date or return null
function parseDate(dateStr) {
  if (!dateStr || dateStr === '') return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// Convert station object to database row
function stationToRow(station) {
  return {
    changeuuid: station.changeuuid || null,
    stationuuid: station.stationuuid,
    serveruuid: station.serveruuid || null,
    name: station.name,
    url: station.url,
    url_resolved: station.url_resolved || null,
    homepage: station.homepage || null,
    favicon: station.favicon || null,
    country: station.country || null,
    countrycode: station.countrycode || null,
    iso_3166_2: station.iso_3166_2 || null,
    state: station.state || null,
    geo_lat: station.geo_lat || null,
    geo_long: station.geo_long || null,
    language: station.language || null,
    languagecodes: station.languagecodes || null,
    tags: station.tags || null,
    codec: station.codec || null,
    bitrate: station.bitrate || null,
    hls: station.hls || 0,
    ssl_error: station.ssl_error || 0,
    votes: station.votes || 0,
    clickcount: station.clickcount || 0,
    clicktrend: station.clicktrend || 0,
    lastcheckok: station.lastcheckok || 0,
    has_extended_info: station.has_extended_info ? 1 : 0,
    lastchangetime: parseDate(station.lastchangetime_iso8601),
    lastchecktime: parseDate(station.lastchecktime_iso8601),
    lastcheckoktime: parseDate(station.lastcheckoktime_iso8601),
    lastlocalchecktime: parseDate(station.lastlocalchecktime_iso8601),
    clicktimestamp: parseDate(station.clicktimestamp_iso8601),
  };
}

// Insert stations in batches
async function insertBatch(connection, stations) {
  if (stations.length === 0) return 0;

  const columns = Object.keys(stations[0]);
  const placeholders = stations.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
  const values = stations.flatMap(station => columns.map(col => station[col]));

  const sql = `
    INSERT INTO radio_stations (${columns.join(', ')})
    VALUES ${placeholders}
  `;

  const [result] = await connection.query(sql, values);
  return result.affectedRows;
}

async function main() {
  let connection;

  try {
    console.log('🚀 Starting radio stations seed process...\n');

    // 1. Check if stations.json exists
    if (!fs.existsSync(STATIONS_FILE)) {
      console.error(`❌ Error: ${STATIONS_FILE} not found!`);
      console.log('📝 Please create stations.json in the project root directory.');
      process.exit(1);
    }

    // 2. Read and parse stations.json
    console.log('📖 Reading stations.json...');
    const stationsData = fs.readFileSync(STATIONS_FILE, 'utf8');
    const stations = JSON.parse(stationsData);

    if (!Array.isArray(stations)) {
      console.error('❌ Error: stations.json must contain an array of stations');
      process.exit(1);
    }

    console.log(`✅ Found ${stations.length} stations to import\n`);

    // 3. Connect to database
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'boarding_user',
      password: process.env.DB_PASSWORD || 'boarding_pass',
      database: process.env.DB_NAME || 'boarding',
      multipleStatements: true,
    });
    console.log('✅ Connected to database\n');

    // 4. Clear existing stations
    console.log('🗑️  Clearing existing stations...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE radio_stations');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Table cleared\n');

    // 5. Convert stations to database rows
    console.log('🔄 Converting station data...');
    const rows = stations.map(stationToRow);
    console.log('✅ Conversion complete\n');

    // 6. Insert stations in batches
    console.log(`💾 Inserting ${rows.length} stations (batch size: ${BATCH_SIZE})...`);
    let totalInserted = 0;
    let batchCount = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const inserted = await insertBatch(connection, batch);
      totalInserted += inserted;
      batchCount++;

      const progress = Math.min(i + BATCH_SIZE, rows.length);
      const percentage = ((progress / rows.length) * 100).toFixed(1);
      process.stdout.write(`\r   Progress: ${progress}/${rows.length} (${percentage}%) - Batch ${batchCount}`);
    }

    console.log('\n✅ All stations inserted successfully!\n');

    // 7. Show statistics
    const [countResult] = await connection.query('SELECT COUNT(*) as count FROM radio_stations');
    const [codecStats] = await connection.query(`
      SELECT codec, COUNT(*) as count
      FROM radio_stations
      WHERE codec IS NOT NULL
      GROUP BY codec
      ORDER BY count DESC
      LIMIT 5
    `);
    const [countryStats] = await connection.query(`
      SELECT countrycode, country, COUNT(*) as count
      FROM radio_stations
      WHERE countrycode IS NOT NULL
      GROUP BY countrycode, country
      ORDER BY count DESC
      LIMIT 5
    `);

    console.log('📊 Import Statistics:');
    console.log('─────────────────────────────────────');
    console.log(`Total stations in database: ${countResult[0].count}`);
    console.log(`\nTop 5 Codecs:`);
    codecStats.forEach(row => {
      console.log(`   ${row.codec}: ${row.count} stations`);
    });
    console.log(`\nTop 5 Countries:`);
    countryStats.forEach(row => {
      console.log(`   ${row.countrycode} (${row.country}): ${row.count} stations`);
    });
    console.log('─────────────────────────────────────\n');

    console.log('🎉 Seed process completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during seed process:');
    console.error(error.message);

    if (error.code === 'ENOENT') {
      console.log('\n💡 Make sure stations.json exists in the project root');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure MySQL is running and credentials are correct');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n💡 Run migrations first: docker-compose up -d');
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('👋 Database connection closed');
    }
  }
}

// Run the script
main();
