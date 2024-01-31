package io.roach.movrapi.entity;

import javax.persistence.*;
import java.util.List;
import java.util.UUID;

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

    // Lab TODO: Add a property containing a
    // list of location history entries

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
}
