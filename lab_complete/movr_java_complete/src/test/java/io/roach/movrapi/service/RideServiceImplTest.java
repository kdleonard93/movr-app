package io.roach.movrapi.service;

import java.sql.Timestamp;
import java.util.Collections;
import java.util.UUID;

import io.roach.movrapi.dao.LocationHistoryRepository;
import io.roach.movrapi.dao.RideRepository;
import io.roach.movrapi.dto.LocationDetailsDTO;
import io.roach.movrapi.entity.LocationHistory;
import io.roach.movrapi.entity.Ride;
import io.roach.movrapi.entity.User;
import io.roach.movrapi.entity.Vehicle;
import io.roach.movrapi.exception.InvalidUUIDException;
import io.roach.movrapi.exception.InvalidValueException;
import io.roach.movrapi.exception.InvalidVehicleStateException;
import io.roach.movrapi.exception.NotFoundException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

/**
 * Unit Tests for RideServiceImpl.class
 */

public class RideServiceImplTest {

    private static final Timestamp TEST_RIDE_START = Timestamp.valueOf("2020-10-30 12:00:00");
    private static final Timestamp TEST_RIDE_END = Timestamp.valueOf("2020-10-30 02:00:00");
    private static final UUID TEST_VEHICLE_UUID = UUID.fromString("4d8c8d73-c503-47e6-a6c9-f8bbe4614d81");
    private static final int TEST_BATTERY = 80;
    private static final double START_LAT = 40.123d;
    private static final double START_LON = -74.654d;
    private static final double END_LAT = 42.123d;
    private static final double END_LON = -74.054d;

    private static final String TEST_EMAIL = "test@test.com";

    @Mock
    private RideRepository rideRepository;

    @Mock
    private LocationHistoryRepository locationHistoryRepository;

    @Mock
    private UserService userService;

    @Mock
    private VehicleService vehicleService;

    private RideService rideService;

    @BeforeEach
    public void init() throws NotFoundException, InvalidVehicleStateException {

        MockitoAnnotations.initMocks(this);
        rideService = new RideServiceImpl(rideRepository, locationHistoryRepository, userService, vehicleService);
        when(userService.getUser(TEST_EMAIL)).thenReturn(dummyUser());
        when(vehicleService.getVehicle(TEST_VEHICLE_UUID)).thenReturn(dummyVehicle());
        when(rideRepository.getActiveRide(TEST_VEHICLE_UUID, TEST_EMAIL))
            .thenReturn(Collections.singletonList(dummyRide()));
        when(vehicleService.checkoutVehicle(TEST_VEHICLE_UUID, START_LAT, START_LON, TEST_RIDE_START)).thenReturn(dummyVehicle());
        when(locationHistoryRepository.findFirstByVehicleIdOrderByTimestampDesc(TEST_VEHICLE_UUID))
            .thenReturn(dummyLocationHistory());

//        when(vehicleService.checkinVehicle(TEST_VEHICLE_UUID, TEST_LAT, TEST_LON, TEST_BATTERY)).thenReturn(dummyVehicle());
    }

    
    @Test
    public void testStartRide() throws InvalidVehicleStateException, NotFoundException {

        ArgumentCaptor<Ride> rideArgumentCaptor =
            ArgumentCaptor.forClass(Ride.class);

        rideService.startRide(TEST_VEHICLE_UUID, TEST_EMAIL, TEST_RIDE_START);
        verify(rideRepository).save(rideArgumentCaptor.capture());
        Ride ride = rideArgumentCaptor.getValue();
        assertEquals(TEST_EMAIL, ride.getUser().getEmail());
        assertEquals(TEST_VEHICLE_UUID, ride.getVehicle().getId());
        assertEquals(TEST_RIDE_START, ride.getStartTime());
        verify(vehicleService).checkoutVehicle(TEST_VEHICLE_UUID, START_LAT, START_LON, TEST_RIDE_START);
    }

    @Test
    public void testEndRide() throws InvalidUUIDException, InvalidVehicleStateException,
        NotFoundException, InvalidValueException {

        ArgumentCaptor<Ride> rideArgumentCaptor =
            ArgumentCaptor.forClass(Ride.class);

        LocationDetailsDTO locationDetailsDTO = rideService.endRide(
            TEST_VEHICLE_UUID, TEST_EMAIL, TEST_BATTERY, END_LAT, END_LON, TEST_RIDE_END);
        verify(rideRepository).save(rideArgumentCaptor.capture());
        Ride ride = rideArgumentCaptor.getValue();
        assertEquals(TEST_EMAIL, ride.getUser().getEmail());
        assertEquals(TEST_VEHICLE_UUID, ride.getVehicle().getId());
        assertNotNull(ride.getStartTime());
        verify(vehicleService).checkinVehicle(TEST_VEHICLE_UUID, END_LAT, END_LON, TEST_BATTERY, TEST_RIDE_END);

        assertEquals(START_LAT, locationDetailsDTO.getLatitude(), "end lat doesn't match");
        assertEquals(START_LON, locationDetailsDTO.getLongitude(), "end lon doesn't match");
        assertEquals(TEST_RIDE_START, locationDetailsDTO.getTimestamp(), "end timestamp doesn't match");
    }


    private User dummyUser() {
        User user = new User();
        user.setEmail(TEST_EMAIL);
        return user;
    }

    private Vehicle dummyVehicle() {
        Vehicle vehicle = new Vehicle();
        vehicle.setId(TEST_VEHICLE_UUID);
        return vehicle;
    }

    private Ride dummyRide() {
        Ride ride = new Ride();
        ride.setId(UUID.randomUUID());
        ride.setStartTime(TEST_RIDE_START);
        ride.setVehicle(dummyVehicle());
        ride.setUser(dummyUser());
        return ride;
    }

    private LocationHistory dummyLocationHistory() {
        LocationHistory locationHistory = new LocationHistory();
        locationHistory.setLongitude(START_LON);
        locationHistory.setLatitude(START_LAT);
        locationHistory.setVehicle(dummyVehicle());
        locationHistory.setId(UUID.randomUUID());
        return locationHistory;
    }

}
