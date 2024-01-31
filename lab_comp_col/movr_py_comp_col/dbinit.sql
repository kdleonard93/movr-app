
SET sql_safe_updates=false;

DROP DATABASE IF EXISTS movr CASCADE; 

CREATE DATABASE movr;

CREATE TABLE movr.vehicles (
    id UUID PRIMARY KEY,
    battery INT8,
    in_use BOOL,
    vehicle_info JSON
    serial_number INT AS (
        (vehicle_info->'purchase_information'->>'serial_number' )::INT8) STORED;
);

/* TBD load data from 10000vehicles_with_type_and_json */


CREATE TABLE movr.location_history(
    id UUID PRIMARY KEY,
    vehicle_id UUID REFERENCES movr.vehicles(id) ON DELETE CASCADE,
    ts TIMESTAMP NOT NULL,
    longitude FLOAT8 NOT NULL,
    latitude FLOAT8 NOT NULL
);

UPDATE movr.vehicles
   SET vehicle_info = json_set(vehicle_info,
                               ARRAY['type'],
                               to_json(vehicle_type))
   WHERE vehicle_type IS NOT NULL;

ALTER TABLE movr.vehicles DROP COLUMN vehicle_type;

CREATE TABLE movr.users (
    email STRING PRIMARY KEY,
    last_name STRING NOT NULL,
    first_name STRING NOT NULL,
    phone_numbers STRING[]
);

/* TBD load data from 10000users */

CREATE TABLE movr.rides (
    id UUID PRIMARY KEY,
    vehicle_id UUID REFERENCES movr.vehicles(id) ON DELETE CASCADE,
    user_email STRING REFERENCES movr.users(email) ON DELETE CASCADE,
    start_ts TIMESTAMP NOT NULL,
    end_ts TIMESTAMP DEFAULT NULL
);

/* TBD load data from location_history */
/* TBD load data from rides */

SET sql_safe_updates=true;
