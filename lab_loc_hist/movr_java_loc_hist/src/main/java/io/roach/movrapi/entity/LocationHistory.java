package io.roach.movrapi.entity;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.UUID;

/**
 * Hibernate entity for Vehicles' Location History Table
 */

@Entity
@Table(name = "location_history")
public class LocationHistory {

	// Lab TODO: Add properties for location_history columns

    @Id
    @GeneratedValue
    private UUID id;

	public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

}
