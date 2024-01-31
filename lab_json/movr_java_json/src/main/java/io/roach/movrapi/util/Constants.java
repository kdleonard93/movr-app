package io.roach.movrapi.util;

/**
 * various constants such as error messages and configuration values that are not expected to change
 */

public class Constants {

    // list of possible error messages
    public static final String ERR_USER_EMAIL_NOT_FOUND = "User email <%s> not found";
    public static final String ERR_USER_ALREADY_EXISTS = "User email <%s> already exists";
    public static final String ERR_VEHICLE_NOT_FOUND = "Vehicle id <%s> not found";
    public static final String ERR_INVALID_VEHICLE_ID = "Vehicle id <%s> is not valid id : %s";
    public static final String ERR_VEHICLE_IN_USE = "Vehicle id <%s> is currently in use";
    public static final String ERR_VEHICLE_NOT_IN_USE = "Vehicle id <%s> is not currently being used";
    public static final String ERR_VEHICLE_LOCATION_MISSING = "Location for Vehicle id <%s> could not be found";
    public static final String ERR_NO_ACTIVE_RIDE = "No active ride for this vehicle <%s> and user <%s> combination.";
    public static final String ERR_DIVIDE_BY_ZERO = "Cannot calculate an average velocity when the time interval is 0.";
    public static final String ERR_BATTERY_INVALID = "Battery (percent) must be between 0 and 100.";
    public static final String ERR_LAT_INVALID = "Latitude must be between -90 and 90.";
    public static final String ERR_LON_INVALID = "Longitude must be between -180 and 180.";

    // success messages
    public static final String MSG_DELETED_EMAIL = "You have successfully deleted your account.";
    public static final String MSG_DELETED_VEHICLE = "Deleted vehicle with id <%s> from database.";
    public static final String MSG_RIDE_STARTED = "Ride started with vehicle %s";
    public static final String MSG_RIDE_ENDED_1 = "You have completed your ride on vehicle %s.";
    public static final String MSG_RIDE_ENDED_2 = "You traveled %.2f km in %.2f minutes, for an average velocity of %.2f km/hr";

    private Constants() {
    }
}
