package io.roach.movrapi.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import io.roach.movrapi.dao.LocationHistoryRepository;
import io.roach.movrapi.dao.VehicleRepository;
import io.roach.movrapi.dao.VehicleWithLocationRepository;
import io.roach.movrapi.entity.LocationHistory;
import io.roach.movrapi.entity.Vehicle;
import io.roach.movrapi.exception.InvalidUUIDException;
import io.roach.movrapi.exception.InvalidVehicleStateException;
import io.roach.movrapi.exception.NotFoundException;
import org.json.JSONObject;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

/**
 * Unit Tests for the VehicleServiceImpl.class
 */


public class VehicleServiceImplTest {

    private static final UUID NON_EXISTING_VEHICLE_UUID = UUID.fromString("18332538-441f-408c-b2be-370b7476d357");
    private static final UUID TEST_EXISTING_VEHICLE_UUID = UUID.fromString("f097eaa6-dd11-4e35-bceb-1b93073d1ec7");
    private static final String TEST_VEHICLE_TYPE = "scooter";
    private static final int TEST_BATTERY = 80;
    private static final double TEST_OLD_LAT = 40.123d;
    private static final double TEST_OLD_LON = -74.654d;
    private static final double TEST_NEW_LAT = 42.324d;
    private static final double TEST_NEW_LON = -73.311d;
    private static final String VEHICLE_TYPE_KEY = "type";
    private static final Timestamp TEST_START_TIME = Timestamp.valueOf(LocalDateTime.now(ZoneOffset.UTC).minusHours(1));
    private static final Timestamp TEST_END_TIME = Timestamp.valueOf(LocalDateTime.now(ZoneOffset.UTC));


    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private VehicleWithLocationRepository vehicleWithLocationRepository;

    @Mock
    private LocationHistoryRepository locationHistoryRepository;

    private VehicleService vehicleService;

    @BeforeEach
    public void init() {

        MockitoAnnotations.initMocks(this);
        vehicleService = new VehicleServiceImpl(vehicleRepository, vehicleWithLocationRepository, locationHistoryRepository);
        when(vehicleRepository.findById(TEST_EXISTING_VEHICLE_UUID))
            .thenReturn(Optional.of(dummyVehicle(TEST_EXISTING_VEHICLE_UUID, false)));
        when(locationHistoryRepository.save(any(LocationHistory.class))).thenReturn(dummyLocationHistory(NON_EXISTING_VEHICLE_UUID));
        when(locationHistoryRepository.findFirstByVehicleIdOrderByTimestampDesc(TEST_EXISTING_VEHICLE_UUID))
            .thenReturn(dummyLocationHistory(TEST_EXISTING_VEHICLE_UUID));
    }

    @Test()
    public void testAdd() {

        ArgumentCaptor<Vehicle> vehicleArgumentCaptor =
            ArgumentCaptor.forClass(Vehicle.class);
        ArgumentCaptor<LocationHistory> locationHistoryArgumentCaptor =
            ArgumentCaptor.forClass(LocationHistory.class);
        configureVehicleSaveAsAdd();

        vehicleService.addVehicle(TEST_NEW_LAT, TEST_NEW_LON, TEST_BATTERY, TEST_VEHICLE_TYPE);

        verify(vehicleRepository).save(vehicleArgumentCaptor.capture());
        Vehicle vehicle = vehicleArgumentCaptor.getValue();
        assertEquals(TEST_BATTERY, vehicle.getBattery());
        String vehicleType = vehicle.getVehicleType();
        assertEquals(TEST_VEHICLE_TYPE, vehicleType);

        verify(locationHistoryRepository).save(locationHistoryArgumentCaptor.capture());
        LocationHistory locationHistory = locationHistoryArgumentCaptor.getValue();
        assertEquals(TEST_NEW_LAT, locationHistory.getLatitude());
        assertEquals(TEST_NEW_LON, locationHistory.getLongitude());
        assertEquals(NON_EXISTING_VEHICLE_UUID, locationHistory.getVehicle().getId());
        assertNotNull(locationHistory.getTimestamp());
    }

    @Test
    public void testGet() throws NotFoundException {
        assertThrows(NotFoundException.class, () -> {
            vehicleService.getVehicle(NON_EXISTING_VEHICLE_UUID);
        });
        Vehicle vehicle = vehicleService.getVehicle(TEST_EXISTING_VEHICLE_UUID);
        assertEquals(TEST_EXISTING_VEHICLE_UUID, vehicle.getId());

        vehicle = vehicleService.getVehicle(TEST_EXISTING_VEHICLE_UUID);
        assertEquals(TEST_EXISTING_VEHICLE_UUID, vehicle.getId());
        
    }


    @Test
    public void testRemove() throws NotFoundException,InvalidVehicleStateException {

        ArgumentCaptor<Vehicle> vehicleArgumentCaptor =
            ArgumentCaptor.forClass(Vehicle.class);

        assertThrows(NotFoundException.class, () -> {
            vehicleService.removeVehicle(NON_EXISTING_VEHICLE_UUID);
        });
        vehicleService.removeVehicle(TEST_EXISTING_VEHICLE_UUID);
        // TBD Add test for InvalidVehicleStateException (in use)
        verify(vehicleRepository).delete(vehicleArgumentCaptor.capture());

        assertEquals(TEST_EXISTING_VEHICLE_UUID, vehicleArgumentCaptor.getValue().getId());
    }

    @Test
    public void testCheckoutVehicle() throws NotFoundException, InvalidVehicleStateException {

        configureVehicleSaveAsUpdate(false);

        ArgumentCaptor<Vehicle> vehicleArgumentCaptor =
            ArgumentCaptor.forClass(Vehicle.class);
        ArgumentCaptor<LocationHistory> locationHistoryArgumentCaptor =
            ArgumentCaptor.forClass(LocationHistory.class);
        assertThrows(NotFoundException.class, () -> {
            vehicleService.checkoutVehicle(NON_EXISTING_VEHICLE_UUID, TEST_OLD_LAT, TEST_OLD_LON, TEST_START_TIME);
        });

        vehicleService.checkoutVehicle(TEST_EXISTING_VEHICLE_UUID, TEST_OLD_LAT, TEST_OLD_LON, TEST_START_TIME);
        verify(vehicleRepository).save(vehicleArgumentCaptor.capture());

        Vehicle vehicle = vehicleArgumentCaptor.getValue();
        assertEquals(TEST_EXISTING_VEHICLE_UUID, vehicle.getId());
        assertEquals(true, vehicle.getInUse());
        
        verify(locationHistoryRepository).save(locationHistoryArgumentCaptor.capture());
        LocationHistory locationHistory = locationHistoryArgumentCaptor.getValue();
        assertEquals(TEST_OLD_LAT, locationHistory.getLatitude());
        assertEquals(TEST_OLD_LON, locationHistory.getLongitude());
        assertEquals(TEST_START_TIME, locationHistory.getTimestamp());
        assertEquals(TEST_EXISTING_VEHICLE_UUID, locationHistory.getVehicle().getId());
    }

    @Test
    public void testCheckoutInUseVehicle() {

        when(vehicleRepository.findById(TEST_EXISTING_VEHICLE_UUID))
            .thenReturn(Optional.of(dummyVehicle(TEST_EXISTING_VEHICLE_UUID, true)));

        assertThrows(InvalidVehicleStateException.class, () -> {
            vehicleService.checkoutVehicle(TEST_EXISTING_VEHICLE_UUID, TEST_OLD_LAT, TEST_OLD_LON, TEST_START_TIME);
        });

    }

    @Test
    public void testCheckinVehicle() throws NotFoundException, InvalidVehicleStateException, InvalidUUIDException {

        configureVehicleSaveAsUpdate(false);
        ArgumentCaptor<Vehicle> vehicleArgumentCaptor =
            ArgumentCaptor.forClass(Vehicle.class);
        ArgumentCaptor<LocationHistory> locationHistoryArgumentCaptor =
            ArgumentCaptor.forClass(LocationHistory.class);

        // set it to "in use" so we can check it in
        when(vehicleRepository.findById(TEST_EXISTING_VEHICLE_UUID))
            .thenReturn(Optional.of(dummyVehicle(TEST_EXISTING_VEHICLE_UUID, true)));

        vehicleService.checkinVehicle(TEST_EXISTING_VEHICLE_UUID, TEST_NEW_LAT, TEST_NEW_LON, TEST_BATTERY, TEST_END_TIME);
        verify(vehicleRepository).save(vehicleArgumentCaptor.capture());

        Vehicle vehicle = vehicleArgumentCaptor.getValue();
        assertEquals(TEST_EXISTING_VEHICLE_UUID, vehicle.getId());
        assertEquals(false, vehicle.getInUse());
        assertEquals(TEST_BATTERY, vehicle.getBattery());

        verify(locationHistoryRepository).save(locationHistoryArgumentCaptor.capture());
        LocationHistory locationHistory = locationHistoryArgumentCaptor.getValue();
        assertEquals(TEST_NEW_LAT, locationHistory.getLatitude());
        assertEquals(TEST_NEW_LON, locationHistory.getLongitude());
        assertEquals(TEST_EXISTING_VEHICLE_UUID, locationHistory.getVehicle().getId());
        assertNotNull(locationHistory.getTimestamp());

    }

    @Test
    public void testCheckInNotInUseVehicle() {

        when(vehicleRepository.findById(TEST_EXISTING_VEHICLE_UUID))
            .thenReturn(Optional.of(dummyVehicle(TEST_EXISTING_VEHICLE_UUID, false)));

        assertThrows(InvalidVehicleStateException.class, () -> {
            vehicleService.checkinVehicle(TEST_EXISTING_VEHICLE_UUID, TEST_NEW_LAT, TEST_NEW_LON, TEST_BATTERY, TEST_END_TIME);
        });

    }

    @Test
    public void testCheckInNotFoundVehicle() {

        assertThrows(NotFoundException.class, () -> {
            vehicleService.checkinVehicle(NON_EXISTING_VEHICLE_UUID, TEST_NEW_LAT, TEST_NEW_LON, TEST_BATTERY, TEST_END_TIME);
        });

    }
    
    private Vehicle dummyVehicle(UUID vehicleId, boolean inUse) {
        Vehicle vehicle = new Vehicle();
        vehicle.setId(vehicleId);
        vehicle.setBattery(TEST_BATTERY);
        vehicle.setVehicleType(TEST_VEHICLE_TYPE);
        vehicle.setInUse(inUse);
        return vehicle;
    }

    private LocationHistory dummyLocationHistory(UUID vehicleId) {
        LocationHistory locationHistory = new LocationHistory();
        locationHistory.setLongitude(TEST_OLD_LON);
        locationHistory.setLatitude(TEST_OLD_LAT);
        locationHistory.setVehicle(dummyVehicle(vehicleId, false));
        locationHistory.setId(UUID.randomUUID());
        return locationHistory;
    }

    private void configureVehicleSaveAsUpdate(boolean inUse) {

        // this setup mocks an update -- the returned vehicle will have an existing key
        when(vehicleRepository.save(any(Vehicle.class)))
            .thenReturn(dummyVehicle(TEST_EXISTING_VEHICLE_UUID, inUse));

    }

    private void configureVehicleSaveAsAdd() {

        // this setup mocks an add -- the returned vehicle will have a new key
        // we have to use the doAnswer format so we can mock the assignment of the vehicleID that Hibernate would normally
        // do (but doesn't since we're mocking it)
        doAnswer(invocation -> {
            assertEquals(1, invocation.getArguments().length);
            Vehicle vehicle = (Vehicle) invocation.getArguments()[0];
            vehicle.setId(NON_EXISTING_VEHICLE_UUID);
            return null;
        }).when(vehicleRepository).save(any(Vehicle.class));

    }
}
