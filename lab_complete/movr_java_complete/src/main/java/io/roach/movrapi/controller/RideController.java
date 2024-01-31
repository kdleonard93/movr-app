package io.roach.movrapi.controller;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import io.roach.movrapi.dto.*;
import io.roach.movrapi.entity.Ride;
import io.roach.movrapi.entity.Vehicle;
import io.roach.movrapi.exception.InvalidUUIDException;
import io.roach.movrapi.exception.InvalidValueException;
import io.roach.movrapi.exception.InvalidVehicleStateException;
import io.roach.movrapi.exception.NotFoundException;
import io.roach.movrapi.service.RideService;
import static io.roach.movrapi.util.Common.*;
import static io.roach.movrapi.util.Constants.*;
import org.json.JSONObject;
import org.modelmapper.ModelMapper;

/**
 * REST Controller to manage ride activities
 */

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private static final ModelMapper modelMapper = new ModelMapper();

    private RideService rideService;

    @Autowired
    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    /**
     * Gets the active ride for this vehicle/user combination.
     *
     * @param vehicleId                the vehicle that the user is riding
     * @param email                    the email address that identifies the user
     * @return                         Json containing details about the ride
     * @throws NotFoundException       if the vehicle or user is not found
     * @throws InvalidUUIDException    if the passed vehicleId string is not a valid UUID
     *
     */
    @GetMapping("/active")
    public ResponseEntity<VehicleWithLocationDTO> getActiveRide(@RequestParam("vehicle_id") String vehicleId,
                                                                @RequestParam String email)
        throws NotFoundException, InvalidUUIDException {

        Ride ride = rideService.getActiveRide(toUUID(vehicleId, ERR_INVALID_VEHICLE_ID), email);
        return ResponseEntity.ok(VehicleHelper.toWithLocationDTO(ride.getVehicle()));
    }

    /**
     * Starts a ride on this vehicle for this user.
     *
     * @param startRideRequestDTO             a POJO holding the json that was passed in
     * @return                                Json with details about the started ride
     * @throws NotFoundException              if the vehicle or user is not found
     * @throws InvalidUUIDException           if the passed vehicleId string is not a valid UUID
     * @throws InvalidVehicleStateException   if the requested vehicle is not already marked "in use"
     */
    @PostMapping("/start")
    public ResponseEntity<StartRideResponseDTO> startRide(@RequestBody StartRideRequestDTO startRideRequestDTO)
        throws NotFoundException, InvalidUUIDException, InvalidVehicleStateException {

        
        Timestamp startTime = Timestamp.valueOf(LocalDateTime.now(ZoneOffset.UTC));
        Ride ride = rideService.startRide(toUUID(startRideRequestDTO.getVehicleId(), ERR_INVALID_VEHICLE_ID),
            startRideRequestDTO.getEmail(), startTime);
        RideDTO rideDTO = toDto(ride);
        StartRideResponseDTO startRideResponseDTO = new StartRideResponseDTO();
        startRideResponseDTO.setRideDTO(rideDTO);
        startRideResponseDTO.setMessages(
            new String[] { String.format(MSG_RIDE_STARTED, startRideRequestDTO.getVehicleId())});
        return ResponseEntity.ok(startRideResponseDTO);
    }

    /**
     * Ends this specific ride (also calculates time, distance, and speed travelled).
     *
     * @param endRideRequestDTO               a POJO holding the json that was passed in
     * @return                                a message about the time, speed and distance travelled
     * @throws NotFoundException              if the vehicle or user is not found
     * @throws InvalidUUIDException           if the passed vehicleId string is not a valid UUID
     * @throws InvalidVehicleStateException   if the requested vehicle is not already marked "in use"
     * @throws InvalidValueException          if the math calculations result in an error
     */
    @PostMapping("/end")
    public ResponseEntity<MessagesDTO> endRide(@RequestBody @Validated EndRideRequestDTO endRideRequestDTO)
        throws NotFoundException, InvalidUUIDException, InvalidVehicleStateException, InvalidValueException {

        Integer battery = convertBatteryToInt(endRideRequestDTO.getBattery());
        Double latitude = convertLatToDouble(endRideRequestDTO.getLatitude());
        Double longitude = convertLonToDouble(endRideRequestDTO.getLongitude());

        Timestamp endTime = Timestamp.valueOf(LocalDateTime.now(ZoneOffset.UTC));
        LocationDetailsDTO locationDetailsDTO = rideService.endRide(
            toUUID(endRideRequestDTO.getVehicleId(), ERR_INVALID_VEHICLE_ID), endRideRequestDTO.getEmail(),
            battery, latitude, longitude, endTime);

        // calculate the time, distance, and speed and return it in a message
        double distance = calculateDistance(locationDetailsDTO.getLatitude(), locationDetailsDTO.getLongitude(),
            latitude, longitude);
        double minutes = calculateDurationMinutes(locationDetailsDTO.getTimestamp(), endTime);
        double speed = calculateVelocity(locationDetailsDTO.getLatitude(),
            locationDetailsDTO.getLongitude(),
            locationDetailsDTO.getTimestamp(),
            latitude,
            longitude,
            endTime);
        String[] messages = {String.format(MSG_RIDE_ENDED_1, endRideRequestDTO.getVehicleId()),
            String.format(MSG_RIDE_ENDED_2, distance, minutes, speed)};

        return ResponseEntity.ok(new MessagesDTO(messages));
    }

    /**
     * Gets a list of all rides for the given user.
     *
     * @param email               email of the user to get rides for
     * @return                    List of all the rides (active and history) for this user
     * @throws NotFoundException  if the vehicle or user is not found
     */
    @GetMapping
    public ResponseEntity<List<RideWithVehicleDTO>> getRides(@RequestParam String email) throws NotFoundException {

        List<Ride> rideDTOList = rideService.getRidesForUser(email);
        return ResponseEntity.ok(toRideWithVehicleDto(rideDTOList));
    }

    /**
     * Converts the Ride entity object to a Data Transfer Object.
     *
     * @param ride  the Ride entity object
     * @return      RideDTO
     */
    private RideDTO toDto(Ride ride) {
        return  modelMapper.map(ride, RideDTO.class);
    }

    /**
     * Converts a list of Ride entity objects to a list of RideWithVehicleDTOs
     *
     * @param rides  list of Ride objects
     * @return       List of RideWithVehicleDTOs
     */
    private List<RideWithVehicleDTO> toRideWithVehicleDto(List<Ride> rides) {

        return rides.stream().map(r -> {
            RideWithVehicleDTO rideWithVehicleDTO =  modelMapper.map(r, RideWithVehicleDTO.class);
            Vehicle vehicle = r.getVehicle();
            modelMapper.map(vehicle, rideWithVehicleDTO);
            rideWithVehicleDTO.setVehicleInfo(new JSONObject(vehicle.getVehicleInfo()).toMap());
            return rideWithVehicleDTO;
        })
        .collect(Collectors.toList());
    }
}

