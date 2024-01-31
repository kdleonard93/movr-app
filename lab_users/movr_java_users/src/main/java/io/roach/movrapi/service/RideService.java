package io.roach.movrapi.service;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import io.roach.movrapi.dto.LocationDetailsDTO;
import io.roach.movrapi.entity.Ride;
import io.roach.movrapi.exception.InvalidUUIDException;
import io.roach.movrapi.exception.InvalidValueException;
import io.roach.movrapi.exception.InvalidVehicleStateException;
import io.roach.movrapi.exception.NotFoundException;

public interface RideService {

    Ride startRide(UUID vehicleId, String userEmail, Timestamp startTime)
        throws NotFoundException, InvalidVehicleStateException;
    LocationDetailsDTO endRide(UUID vehicleId, String userEmail, int battery, double latitude,
                               double longitude, Timestamp endTime)
        throws InvalidUUIDException, NotFoundException, InvalidVehicleStateException, InvalidValueException;
    List<Ride> getRidesForUser(String userEmail) throws NotFoundException;
    Ride getActiveRide(UUID vehicleId, String userEmail) throws InvalidUUIDException, NotFoundException;

}
