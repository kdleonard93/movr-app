package io.roach.movrapi.dto;

import java.util.Map;
import java.util.UUID;

/**
 * Base Data Transfer Object for Vehicle Entity (abstract)
 */

public abstract class VehicleDTO {

    private UUID id;
    private String vehicleType;
    private int battery;
    private boolean inUse;
    private int serialNumber;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public int getBattery() {
        return battery;
    }

    public void setBattery(int battery) {
        this.battery = battery;
    }

    public boolean isInUse() {
        return inUse;
    }

    public void setInUse(boolean inUse) {
        this.inUse = inUse;
    }

    public int getSerialNumber() {
        return serialNumber;
    }
    public void setSerialNumber(int serialNumber) {
        this.serialNumber = serialNumber;
    }
}
