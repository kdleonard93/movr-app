package io.roach.movrapi.controller;

import javax.validation.constraints.Min;
import java.util.List;

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
import static io.roach.movrapi.util.Common.*;
import static io.roach.movrapi.util.Constants.ERR_INVALID_VEHICLE_ID;
import static io.roach.movrapi.util.Constants.MSG_DELETED_VEHICLE;

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
     * Gets a list of vehicles with their location(limited by passed value).
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

}

