package io.roach.movrapi.entity;

import javax.persistence.*;
import java.util.List;
import java.util.UUID;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

/**
 * Hibernate entity for the Vehicles Table
 */

@Entity
@Table(name = "vehicles")
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class Vehicle {

    @Id
    @GeneratedValue
    private UUID id;
    private Integer battery;
    private Boolean inUse;
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "vehicle", cascade = CascadeType.ALL)
    @OrderBy("timestamp DESC")
    private List<LocationHistory> locationHistoryList;
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<Ride> rideList;

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

    public List<LocationHistory> getLocationHistoryList() {
        return locationHistoryList;
    }

    public void setLocationHistoryList(List<LocationHistory> locationHistoryList) {
        this.locationHistoryList = locationHistoryList;
    }

    public List<Ride> getRideList() {
        return rideList;
    }

    public void setRideList(List<Ride> rideList) {
        this.rideList = rideList;
    }
}
