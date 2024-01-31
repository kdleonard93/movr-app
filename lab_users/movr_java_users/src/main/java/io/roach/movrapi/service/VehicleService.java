package io.roach.movrapi.service;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import io.roach.movrapi.entity.Vehicle;
import io.roach.movrapi.entity.VehicleWithLocation;
import io.roach.movrapi.exception.InvalidVehicleStateException;
import io.roach.movrapi.exception.NotFoundException;

/**
 *  Service to handle basic CRUD functions for vehicles
 */
public interface VehicleService {

    Integer MAX_VEHICLES_TO_RETURN = 20;  // default LIMIT when querying

    Vehicle addVehicle(double latitude, double longitude, int batteryLevel, String vehicleType);
    void removeVehicle(UUID vehicleId) throws NotFoundException,InvalidVehicleStateException;
    List<Vehicle> getVehicles(Integer maxRecords);
    List<VehicleWithLocation> getVehiclesWithLocation(Integer maxRecords);
    Vehicle getVehicle(UUID vehicleId) throws NotFoundException;
    Vehicle checkoutVehicle(UUID vehicleId, double latitude, double longitude, Timestamp timestamp) throws NotFoundException, InvalidVehicleStateException;
    void checkinVehicle(UUID vehicleId, double latitude, double longitude, int batteryLevel, Timestamp timestamp) throws NotFoundException,
        InvalidVehicleStateException;
}
