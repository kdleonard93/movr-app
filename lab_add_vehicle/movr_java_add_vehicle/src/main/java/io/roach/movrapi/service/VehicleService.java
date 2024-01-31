package io.roach.movrapi.service;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import io.roach.movrapi.util.RideResults;

import io.roach.movrapi.entity.Vehicle;
import io.roach.movrapi.exception.InvalidVehicleStateException;
import io.roach.movrapi.exception.NotFoundException;
import io.roach.movrapi.exception.InvalidValueException;

/**
 *  Service to handle basic CRUD functions for vehicles

 */
public interface VehicleService {

    Integer MAX_VEHICLES_TO_RETURN = 20;        // system default of number of vehicles to return

    Vehicle addVehicle(double latitude, double longitude, int batteryLevel, String vehicleType);
    void removeVehicle(UUID vehicleId) throws NotFoundException,InvalidVehicleStateException;
    List<Vehicle> getVehicles(Integer maxRecords);
    Vehicle getVehicle(UUID vehicleId) throws NotFoundException;
    Vehicle checkoutVehicle(UUID vehicleId, Timestamp timestamp) throws NotFoundException, InvalidVehicleStateException;
    RideResults checkinVehicle(UUID vehicleId, double latitude, double longitude, int batteryLevel, Timestamp timestamp) 
    	throws NotFoundException, InvalidVehicleStateException, InvalidValueException;

}
