package io.roach.movrapi.controller;

import javax.validation.constraints.Min;
import java.util.List;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import io.roach.movrapi.dto.MessagesDTO;
import io.roach.movrapi.dto.NewVehicleDTO;
import io.roach.movrapi.dto.VehicleWithHistoryDTO;
import io.roach.movrapi.dto.VehicleWithLocationDTO;
import io.roach.movrapi.entity.Vehicle;
import io.roach.movrapi.entity.VehicleWithLocation;
import io.roach.movrapi.exception.InvalidUUIDException;
import io.roach.movrapi.exception.InvalidValueException;
import io.roach.movrapi.exception.InvalidVehicleStateException;
import io.roach.movrapi.exception.NotFoundException;
import io.roach.movrapi.service.VehicleService;
import io.roach.movrapi.util.RideResults;

import io.roach.movrapi.dto.LocationDetailsDTO;
import io.roach.movrapi.entity.LocationHistory;
import io.roach.movrapi.dto.VehicleCheckinRequestDTO;

import static io.roach.movrapi.util.Common.*;
import static io.roach.movrapi.util.Constants.ERR_INVALID_VEHICLE_ID;
import static io.roach.movrapi.util.Constants.MSG_DELETED_VEHICLE;
import static io.roach.movrapi.util.Constants.MSG_RIDE_ENDED_1;
import static io.roach.movrapi.util.Constants.MSG_RIDE_ENDED_2;
import static io.roach.movrapi.util.Constants.MSG_RIDE_STARTED;

/**
 * REST Controller to manage basic vehicle activities
 */

@RestController
@RequestMapping("/api/vehicles")
@Validated
public class VehicleController {

    private VehicleService vehicleService;

    @Autowired
    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    /**
     * Adds a vehicle.
     *
     * @param newVehicleDTO             a POJO holding the json that was passed in containing the vehicle details
     * @return                          the generated uuid (key) of the added vehicle
     */
    @PostMapping("/add")
    public ResponseEntity<String> addVehicle(@RequestBody NewVehicleDTO newVehicleDTO) throws InvalidValueException {

        Vehicle vehicle = vehicleService.addVehicle(convertLatToDouble(newVehicleDTO.getLatitude()),
                                                    convertLonToDouble(newVehicleDTO.getLongitude()),
                                                    convertBatteryToInt(newVehicleDTO.getBattery()),
                                                    newVehicleDTO.getVehicleType());
        return ResponseEntity.ok(vehicle.getId().toString());
    }

    /**
     * Gets a list of all vehicles (limited by passed value).
     *
     * @param maxVehicles              the maximum number of vehicle rows to return
     * @return                         a json array containing the vehicle details
     * @throws InvalidValueException   if you pass 0 or a negative value for the maximum rows to return
     */
    @GetMapping
    public ResponseEntity<List<VehicleWithLocationDTO>> getVehiclesWithLocation(
            @RequestParam(value = "max_vehicles", required = false) @Min(1) Integer maxVehicles) {

        List<VehicleWithLocation> vehicleWithLocationList = vehicleService.getVehiclesWithLocation(maxVehicles);
        return ResponseEntity.ok(VehicleHelper.toVehicleWithLocationDTOList(vehicleWithLocationList));

    }

    /**
     * Gets a specific vehicle with its location history.
     *
     * @param vehicleId               the uuid of the vehicle to return location history for
     * @return                        json with the vehicle details and a json array of all its past locations
     * @throws InvalidUUIDException   if the passed vehicleId string is not a valid UUID
     * @throws NotFoundException      if the passed vehicleId is not in the database
     */
    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleWithHistoryDTO> getVehicleWithHistory(@PathVariable String vehicleId)
        throws InvalidUUIDException, NotFoundException {

        Vehicle vehicle = vehicleService.getVehicle(toUUID(vehicleId, ERR_INVALID_VEHICLE_ID));
        return ResponseEntity.ok(VehicleHelper.toWithHistoryDTO(vehicle));
    }

    /**
     * Removes a specific vehicle.
     *
     * @param vehicleId               the uuid of the vehicle to delete
     * @return                        "nothing"
     * @throws InvalidUUIDException   if the passed vehicleId string is not a valid UUID
     * @throws NotFoundException      if the passed vehicleId is not in the database
     */
    @DeleteMapping("/{vehicleId}/delete")
    public ResponseEntity<MessagesDTO> removeVehicle(@PathVariable String vehicleId)
        throws InvalidUUIDException, NotFoundException, InvalidVehicleStateException {

        vehicleService.removeVehicle(toUUID(vehicleId, ERR_INVALID_VEHICLE_ID));

        String response = String.format(MSG_DELETED_VEHICLE, vehicleId);
        return ResponseEntity.ok(new MessagesDTO(response));
    }

    /**
     * Checks out a specific vehicle 
     *
     * @param vehicleId               the uuid of the vehicle to delete
     * @return                        "nothing"
     * @throws InvalidUUIDException   if the passed vehicleId string is not a valid UUID
     * @throws NotFoundException      if the passed vehicleId is not in the database
     * @throws InvalidVehicleStateException - if the vehicle is already checked out
    */
    @PutMapping("/{vehicleId}/checkout")
    public ResponseEntity<MessagesDTO> checkoutVehicle(@PathVariable String vehicleId)
        throws InvalidUUIDException, NotFoundException, InvalidVehicleStateException {

        // what's the current time?
        Timestamp startTime = Timestamp.valueOf(LocalDateTime.now(ZoneOffset.UTC));
        Vehicle vehicle = vehicleService.checkoutVehicle(toUUID(vehicleId, ERR_INVALID_VEHICLE_ID), startTime);
 
        String response = String.format(MSG_RIDE_STARTED, vehicleId);

        return ResponseEntity.ok(new MessagesDTO(response));
    }

    /**
     * Checks in a specific vehicle 
     *
     * @param vehicleId               the uuid of the vehicle to delete
     * @return                        "nothing"
     * @throws InvalidUUIDException   if the passed vehicleId string is not a valid UUID
     * @throws NotFoundException      if the passed vehicleId is not in the database
     * @throws InvalidVehicleStateException - if the vehicle is not checked out
    */

    @PutMapping("/{vehicleId}/checkin")
    public ResponseEntity<MessagesDTO> checkinVehicle(@PathVariable String vehicleId, @RequestBody @Validated VehicleCheckinRequestDTO vehicleCheckinRequestDTO)
        throws InvalidUUIDException, NotFoundException, InvalidVehicleStateException, InvalidValueException {

        Integer battery = convertBatteryToInt(vehicleCheckinRequestDTO.getBattery());
        Double latitude = convertLatToDouble(vehicleCheckinRequestDTO.getLatitude());
        Double longitude = convertLonToDouble(vehicleCheckinRequestDTO.getLongitude());
        Timestamp endTime = Timestamp.valueOf(LocalDateTime.now(ZoneOffset.UTC));

        RideResults rideResults = vehicleService.checkinVehicle(toUUID(vehicleId, ERR_INVALID_VEHICLE_ID), 
            latitude, longitude, battery, endTime);

        String[] messages = {String.format(MSG_RIDE_ENDED_1, vehicleId),
            String.format(MSG_RIDE_ENDED_2, rideResults.getDistance(), rideResults.getMinutes(), rideResults.getSpeed())};

        return ResponseEntity.ok(new MessagesDTO(messages));
    }

}

