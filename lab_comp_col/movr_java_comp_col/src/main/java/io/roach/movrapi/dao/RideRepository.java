package io.roach.movrapi.dao;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import io.roach.movrapi.entity.Ride;

/**
 * JPA Repository for Location History
 */

@Repository
public interface RideRepository extends JpaRepository<Ride, UUID> {

    /**
     * Query to return all rides for a current user, with most recent rides first.
     *
     * The @Query annotation asks JPA to build a SQL query using the database relationships
     * described in the DAO entities (in this case Ride and User) for this vehicle/user
     * combination and sort it by newest to oldest
     *
     * @param email the email address identifying the user to retrieve rides for
     * @return      a list of Ride entities
     */
    @Query("select r from Ride r where r.user.email = :email order by r.startTime desc")
    List<Ride> findAllForUser(@Param("email") String email);

    /**
     * Query to get the most recent active ride for a specific user/vehicle combination.
     *
     * The @Query annotation asks JPA to build a SQL query using the database relationships for this
     * described in the DAO entities (in this case Ride, Vehicle and User) for this vehicle/user
     * combination where the vehicle is still marked "in use"
     *
     * @param uuid   the UUID vehicle that the user is riding
     * @param email  the email address that identifies the user
     * @return       a list of Ride entities
     */
    @Query("select r from Ride r where r.user.email = :email and r.vehicle.id = :uuid and " +
        "r.vehicle.inUse = true and r.endTime is null order by r.startTime desc")
    List<Ride> getActiveRide(@Param("uuid") UUID uuid,  @Param("email") String email);
}
