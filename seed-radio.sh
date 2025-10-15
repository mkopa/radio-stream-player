#!/bin/bash

curl -o stations.json https://fi1.api.radio-browser.info/json/stations
DB_HOST=localhost node scripts/seed-stations.js
rm stations.json
