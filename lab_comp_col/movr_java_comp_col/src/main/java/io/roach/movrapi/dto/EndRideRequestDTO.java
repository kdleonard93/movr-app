package io.roach.movrapi.dto;

/**
 * Data transfer object to pass end ride info
 */

public class EndRideRequestDTO extends StartRideRequestDTO {

    private String battery;
    private String longitude;
    private String latitude;

    public String getBattery() {
        return battery;
    }

    public void setBattery(String battery) {
        this.battery = battery;
    }

    public String getLongitude() {
        return longitude;
    }

    public void setLongitude(String longitude) {
        this.longitude = longitude;
    }

    public String getLatitude() {
        return latitude;
    }

    public void setLatitude(String latitude) {
        this.latitude = latitude;
    }
}
