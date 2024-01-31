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
