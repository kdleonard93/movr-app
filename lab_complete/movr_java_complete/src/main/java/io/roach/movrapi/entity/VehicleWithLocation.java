package io.roach.movrapi.entity;

import javax.persistence.*;
import java.util.List;
import java.sql.Timestamp;
import java.util.UUID;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

/**
 * Hibernate entity for the Vehicles Table joined with the last entry from
 * the location_history table into a single entity.
 */

// Removed an @Table annotation from this.
@Entity
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class VehicleWithLocation {

    @Id
    @GeneratedValue
    private UUID id;
    private Integer battery;
    private Boolean inUse;
    // JPA/Hibernate cannot handle JSONB directly, so we define it as a
    // UserType using Hibernate Types
    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private String vehicleInfo;
    @Column(updatable = false, insertable = false)
    private String serialNumber;

    // Virtual properties that we'll need from LocationHistory. Use only custom
    // queries to access these three.
    private Timestamp timestamp;
    private Double lastLongitude;
    private Double lastLatitude;

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

    public String getVehicleInfo() {
        return vehicleInfo;
    }

    public void setVehicleInfo(String vehicleInfo) {
        this.vehicleInfo = vehicleInfo;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    // Method for a virtual column (use only custom queries for this)
    public Timestamp getTimestamp() {
        return timestamp;
    }

    // Method for a virtual column (use only custom queries for this)
    public Double getLastLongitude() {
        return lastLongitude;
    }

    // Method for a virtual column (use only custom queries for this)
    public Double getLastLatitude() {
        return lastLatitude;
    }
}
