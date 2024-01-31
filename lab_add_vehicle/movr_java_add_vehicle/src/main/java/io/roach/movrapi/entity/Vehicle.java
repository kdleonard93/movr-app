package io.roach.movrapi.entity;

import javax.persistence.*;
import java.util.UUID;
import java.sql.Timestamp;

import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

/**
 * Hibernate entity for the Vehicles Table
 */

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue
    private UUID id;
    private Integer battery;
    private Boolean inUse;
    private String vehicleType;
    private double lastLongitude;
    private double lastLatitude;
    private Timestamp lastCheckin;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Integer getBattery() {
        return battery;
    }

    public void setBattery(Integer battery) {
        this.battery = battery;
    }

    public Boolean getInUse() {
        return inUse;
    }

    public void setInUse(Boolean inUse) {
        this.inUse = inUse;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public double getLastLongitude() {
        return lastLongitude;
    }

    public void setLastLongitude(double lastLongitude) {
        this.lastLongitude = lastLongitude;
    }

    public double getLastLatitude() {
        return lastLatitude;
    }

    public void setLastLatitude(double lastLatitude) {
        this.lastLatitude = lastLatitude;
    }

    public Timestamp getLastCheckin() {
        return lastCheckin;
    }

    public void setLastCheckin(Timestamp lastCheckin) {
        this.lastCheckin = lastCheckin;
    }
    
}
