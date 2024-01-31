DROP DATABASE IF EXISTS movr CASCADE; 

CREATE DATABASE movr;

CREATE TABLE movr.vehicles (
    id UUID PRIMARY KEY,
    battery INT8,
    in_use BOOL,
    vehicle_type STRING NOT NULL
);

CREATE TABLE movr.location_history(
    id UUID PRIMARY KEY,
    vehicle_id UUID REFERENCES movr.vehicles(id) ON DELETE CASCADE,
    ts TIMESTAMP NOT NULL,
    longitude FLOAT8 NOT NULL,
    latitude FLOAT8 NOT NULL
);

/* load data from:
vehicles_data 
location_history_data */