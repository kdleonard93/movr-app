package io.roach.movrapi.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import io.roach.movrapi.dao.LocationHistoryRepository;
import io.roach.movrapi.dao.VehicleRepository;
import io.roach.movrapi.dao.VehicleWithLocationRepository;
import io.roach.movrapi.entity.LocationHistory;
import io.roach.movrapi.entity.Vehicle;
import io.roach.movrapi.entity.VehicleWithLocation;
import io.roach.movrapi.exception.InvalidVehicleStateException;
import io.roach.movrapi.exception.NotFoundException;
import static io.roach.movrapi.util.Constants.ERR_VEHICLE_IN_USE;
import static io.roach.movrapi.util.Constants.ERR_VEHICLE_NOT_FOUND;
import static io.roach.movrapi.util.Constants.ERR_VEHICLE_NOT_IN_USE;

/**
 * Implementation of the Vehicle Service Interface
 */

@Service
public class VehicleServiceImpl implements VehicleService {

    private VehicleRepository vehicleRepository;
    private VehicleWithLocationRepository vehicleWithLocationRepository;
    private LocationHistoryRepository locationHistoryRepository;

    @Autowired
    public VehicleServiceImpl(VehicleRepository vehicleRepository,
                    VehicleWithLocationRepository vehicleWithLocationRepository,
                    LocationHistoryRepository locationHistoryRepository) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleWithLocationRepository = vehicleWithLocationRepository;
        this.locationHistoryRepository = locationHistoryRepository;
    }

    /**
     * Adds a new vehicle (with its current location).
     *
     * @param latitude        the current latitude of the vehicle
     * @param longitude       the current longitude of the vehicle
     * @param batteryLevel    the current battery level of the vehicle
     * @param vehicleType     the type of the vehicle
     * @return                the entity object representing the vehicle
     */
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Vehicle addVehicle(double latitude, double longitude, int batteryLevel, String vehicleType)  {

        Vehicle vehicle = new Vehicle();
        vehicle.setInUse(false);
        vehicle.setBattery(batteryLevel);
        vehicle.setVehicleType(vehicleType);
        vehicleRepository.save(vehicle);

        LocationHistory locationHistory = new LocationHistory();
        locationHistory.setVehicle(vehicle);
        locationHistory.setLatitude(latitude);
        locationHistory.setLongitude(longitude);
        locationHistory.setTimestamp(Timestamp.valueOf(LocalDateTime.now()));
        locationHistoryRepository.save(locationHistory);

        return vehicle;
    }

    /**
     * Removes the specified vehicle.
     *
     * @param vehicleId             the UUID of the vehicle to delete
     * @throws NotFoundException    if the vehicle id does not exist in the database
     * @throws InUseException       if the vehicle is in use
     */
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void removeVehicle(UUID vehicleId) throws NotFoundException,InvalidVehicleStateException {
        Vehicle vehicle = getVehicle(vehicleId);
        if (vehicle.getInUse()) {
            throw new InvalidVehicleStateException(String.format(ERR_VEHICLE_IN_USE, vehicleId.toString()));
        }
        else {
            vehicleRepository.delete(vehicle);
        }
    }

    /**
     * Gets all vehicles w/ their current location (up to the limit requested).
     *
     * @param maxRecords    the maximum number of vehicles to return (null defaults to MAX_VEHICLES_TO_RETURN)
     * @return              a list of vehicle entity objects
     */
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE, readOnly = true)
    public List<VehicleWithLocation> getVehiclesWithLocation(Integer maxRecords) {
        int max = maxRecords == null ? MAX_VEHICLES_TO_RETURN : maxRecords;
        return vehicleWithLocationRepository.getVehiclesWithLocation(max);
    }

    /**
     * Gets all vehicles (up to the limit requested).
     *
     * @param maxRecords    the maximum number of vehicles to return (null defaults to MAX_VEHICLES_TO_RETURN)
     * @return              a list of vehicle entity objects
     */
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE, readOnly = true)
    public List<Vehicle> getVehicles(Integer maxRecords) {
        int max = maxRecords == null ? MAX_VEHICLES_TO_RETURN : maxRecords;
        Pageable limit = PageRequest.of(0, max, Sort.by("id"));
        return vehicleRepository.findAll(limit).toList();
    }

    /**
     * Gets a specific vehicle.
     *
     * @param vehicleId             the UUID of the vehicle to retrieve
     * @return                      entity object representing the vehicle
     * @throws NotFoundException    if the vehicle id does not exist in the database
     */
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE, readOnly = true)
    public Vehicle getVehicle(UUID vehicleId) throws NotFoundException {
        Optional<Vehicle> vehicleOptional = vehicleRepository.findById(vehicleId);
        if (!vehicleOptional.isPresent()) {
            throw new NotFoundException(String.format(ERR_VEHICLE_NOT_FOUND, vehicleId.toString()));
        }
        return vehicleOptional.get();
    }

    /**
     * Marks a vehicle as "in use" (typically called at the beginning of a ride).
     *
     * @param vehicleId                     the UUID of the vehicle to mark as "in use"
     * @param latitude                      the latitude of the new location of the vehicle
     * @param longitude                     the latitude of the new location of the vehicle
     * @param timestamp                     the date/time to check the vehicle out
     * @return                              an entity object representing the vehicle
     * @throws NotFoundException            if the vehicle id does not exist in the database
     * @throws InvalidVehicleStateException if the vehicle is already marked "in use"
     */
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Vehicle checkoutVehicle(UUID vehicleId, double latitude, double longitude, Timestamp timestamp)
        throws NotFoundException, InvalidVehicleStateException {

        Vehicle vehicle = getVehicle(vehicleId);
        if (vehicle.getInUse()) {
            throw new InvalidVehicleStateException(String.format(ERR_VEHICLE_IN_USE, vehicleId.toString()));
        }

        addLocationHistory(vehicle, latitude, longitude, timestamp);

        vehicle.setInUse(true);
        vehicleRepository.save(vehicle);
        return vehicle;
    }

    /**
     * Marks a vehicle as NOT "in use", and updates its new location and battery level
     * (typically called after a ride is ended).
     *
     * @param vehicleId                     the UUID of the vehicle to mark as no longer "in use"
     * @param latitude                      the latitude of the new location of the vehicle
     * @param longitude                     the latitude of the new location of the vehicle
     * @param batteryLevel                  the new battery level
     * @param timestamp                     the date/time to check the vehicle in
     * @throws NotFoundException            if the vehicle id does not exist in the database
     * @throws InvalidVehicleStateException if the vehicle is not currently marked "in use"
     */
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void checkinVehicle(UUID vehicleId, double latitude, double longitude, int batteryLevel, Timestamp timestamp)
        throws NotFoundException, InvalidVehicleStateException {

        Vehicle vehicle = getVehicle(vehicleId);
        if (!vehicle.getInUse()) {
            // in a production application, we'd probably log this as an error and then try to handle it gracefully
            // by hiding the error from the end-user. For now, we want to hard error so we can debug easier.
            throw new InvalidVehicleStateException(String.format(ERR_VEHICLE_NOT_IN_USE, vehicleId));
        }

        addLocationHistory(vehicle, latitude, longitude, timestamp);

        vehicle.setInUse(false);
        vehicle.setBattery(batteryLevel);
        vehicleRepository.save(vehicle);

    }

    /**
     * Adds a new location history record for a vehicle
     *
     * @param vehicle               the UUID of the vehicle
     * @param latitude              the latitude of the location of the vehicle
     * @param longitude             the latitude of the location of the vehicle
     * @param timestamp             the date/time the vehicle was at this location
     */
    private void addLocationHistory(Vehicle vehicle, double latitude, double longitude, Timestamp timestamp) {

        LocationHistory locationHistory = new LocationHistory();
        locationHistory.setVehicle(vehicle);
        locationHistory.setLatitude(latitude);
        locationHistory.setLongitude(longitude);
        locationHistory.setTimestamp(timestamp);
        locationHistoryRepository.save(locationHistory);

    }
}
