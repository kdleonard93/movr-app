DROP DATABASE IF EXISTS movr CASCADE; 

CREATE DATABASE movr;

CREATE TABLE movr.vehicles (
    id UUID PRIMARY KEY,
    last_longitude FLOAT8,
    last_latitude FLOAT8,
    battery INT8,
    last_checkin TIMESTAMP,
    in_use BOOL,
    vehicle_type STRING NOT NULL
);

/* load data from vehicles_data_with_lat_long */