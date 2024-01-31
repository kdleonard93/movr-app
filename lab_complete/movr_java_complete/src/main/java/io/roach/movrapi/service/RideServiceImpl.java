package io.roach.movrapi.service;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import io.roach.movrapi.dao.LocationHistoryRepository;
import io.roach.movrapi.dao.RideRepository;
import io.roach.movrapi.dto.LocationDetailsDTO;
import io.roach.movrapi.entity.LocationHistory;
import io.roach.movrapi.entity.Ride;
import io.roach.movrapi.entity.User;
import io.roach.movrapi.entity.Vehicle;
import io.roach.movrapi.exception.InvalidValueException;
import io.roach.movrapi.exception.InvalidVehicleStateException;
import io.roach.movrapi.exception.NotFoundException;
import static io.roach.movrapi.util.Constants.ERR_NO_ACTIVE_RIDE;
import static io.roach.movrapi.util.Constants.ERR_VEHICLE_LOCATION_MISSING;
import org.modelmapper.ModelMapper;

/**
 * Implementation of the Ride Service Interface
 */

@Service
public class RideServiceImpl implements RideService {

    private static final ModelMapper mapper = new ModelMapper();

    private RideRepository rideRepository;
    private LocationHistoryRepository locationHistoryRepository;
    private UserService userService;
    private VehicleService vehicleService;

    @Autowired
    public RideServiceImpl(RideRepository rideRepository,
                           LocationHistoryRepository locationHistoryRepository,
                           UserService userService,
                           VehicleService vehicleService) {
        this.rideRepository = rideRepository;
        this.locationHistoryRepository = locationHistoryRepository;
        this.userService = userService;
        this.vehicleService = vehicleService;
    }

    /**
     * Starts a ride for this vehicle/user combination.
     *
     * @param vehicleId                         the vehicle that the user will be riding
     * @param userEmail                         the email address that identifies the user
     * @param startTime                         the date/time that the user is starting their ride
     * @return                                  the Ride object representing the user's ride
     * @throws NotFoundException                if the vehicle or user is not found
     * @throws InvalidVehicleStateException     if the vehicle is already in-use
     */
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Ride startRide(UUID vehicleId, String userEmail, Timestamp startTime)
        throws NotFoundException, InvalidVehicleStateException {

        User user = userService.getUser(userEmail);

        // get the location so we can calculate speed and distance travelled
        LocationHistory locationHistory = locationHistoryRepository.findFirstByVehicleIdOrderByTimestampDesc(vehicleId);
        if (locationHistory == null) {
            throw new InvalidVehicleStateException(String.format(ERR_VEHICLE_LOCATION_MISSING, vehicleId.toString()));
        }

        Vehicle vehicle = vehicleService.checkoutVehicle(vehicleId, locationHistory.getLatitude(),
            locationHistory.getLongitude(), startTime);

        Ride ride = new Ride();
        ride.setUser(user);
        ride.setVehicle(vehicle);
        ride.setStartTime(startTime);
        rideRepository.save(ride);

        return ride;
    }

    /**
     * Ends the active ride for this vehicle/email combination.
     *
     * @param vehicleId                     the vehicle that the user will be riding
     * @param userEmail                     the email address that identifies the user
     * @param battery                       the battery level at the end of the ride
     * @param latitude                      the latitude position of the vehicle at the end of the ride
     * @param longitude                     the longitude position of the vehicle at the end of the ride
     * @param endTime                       the date/time the ride ended
     * @return                              A status message describing the distance travelled, speed, and duration
     * @throws InvalidVehicleStateException if the vehicle is not marked in-use
     * @throws NotFoundException            if the vehicle or user is not found
     * @throws InvalidValueException        if an error occurs during the math calculations
     */
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public LocationDetailsDTO endRide(UUID vehicleId, String userEmail, int battery, double latitude,
                                      double longitude, Timestamp endTime)
        throws NotFoundException, InvalidVehicleStateException {

        // get the active ride for this user/vehicle
        Ride ride = getActiveRide(vehicleId, userEmail);

        // get the location so we can calculate speed and distance travelled
        LocationHistory locationHistory = locationHistoryRepository.findFirstByVehicleIdOrderByTimestampDesc(vehicleId);
        if (locationHistory == null) {
            throw new InvalidVehicleStateException(String.format(ERR_VEHICLE_LOCATION_MISSING, vehicleId.toString()));
        }

        // mark the vehicle as "available" and update the battery status
        vehicleService.checkinVehicle(vehicleId, latitude, longitude, battery, endTime);

        // set the end time for the ride
        ride.setEndTime(endTime);
        rideRepository.save(ride);

        LocationDetailsDTO locationDetailsDTO = mapper.map(locationHistory, LocationDetailsDTO.class);
        // return ride start time, not last checkin, so we can calculate ride details later
        locationDetailsDTO.setTimestamp(ride.getStartTime());
        return locationDetailsDTO;

    }

    /**
     * Gets all rides for the specified user.
     *
     * @param userEmail           the email address that identifies the user
     * @return                    List of ride objects for this user
     * @throws NotFoundException  if the user is not found
     */
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE, readOnly = true)
    public List<Ride> getRidesForUser(String userEmail) throws NotFoundException {
        // check that user is valid (will throw exception if not)
        userService.getUser(userEmail);
        List<Ride> rideList = rideRepository.findAllForUser(userEmail);
        return rideList;
    }

    /**
     * Gets a specific active ride (user/vehicle combination).
     *
     * @param vehicleId           the vehicle that the user is riding
     * @param userEmail           the email address that identifies the user
     * @return                    the Ride object representing the requested ride
     * @throws NotFoundException  if the vehicle or user is not found
     */
    @Override
    public Ride getActiveRide(UUID vehicleId, String userEmail) throws NotFoundException {

        // check that vehicle and user are valid
        userService.getUser(userEmail);
        Vehicle vehicle = vehicleService.getVehicle(vehicleId);
        // should only be one active, but get a list just in case
        List<Ride> rideList = rideRepository.getActiveRide(vehicle.getId(), userEmail);
        if (rideList.isEmpty()) {
            throw new NotFoundException(String.format(ERR_NO_ACTIVE_RIDE, vehicleId, userEmail));
        }
        return rideList.get(0);
        
    }
}
