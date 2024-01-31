package io.roach.movrapi.util;

/**
 * POJO to pass speed, location and duration of a ride
 */

public class RideResults {

    private double distance;
    private double minutes;
    private double speed;

    public double getDistance() {
        return distance;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }

    public double getMinutes() {
        return minutes;
    }

    public void setMinutes(double minutes) {
        this.minutes = minutes;
    }

    public double getSpeed() {
        return speed;
    }

    public void setSpeed(double speed) {
        this.speed = speed;
    }
}
