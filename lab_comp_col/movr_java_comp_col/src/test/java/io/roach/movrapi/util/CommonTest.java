package io.roach.movrapi.util;


import java.sql.Timestamp;
import java.time.LocalDateTime;

import io.roach.movrapi.exception.InvalidValueException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;

/**
 *  Misc math tests
 */

public class CommonTest {

    // create known time interval (30 minutes)
    private static final long TEST_DURATION_MINUTES = 30;
    private static final LocalDateTime TEST_START_DATE_TIME =
        LocalDateTime.of(2020, 10, 30, 12, 00);
    private static final LocalDateTime TEST_END_DATE_TIME = TEST_START_DATE_TIME.plusMinutes(TEST_DURATION_MINUTES);

    // known distance between the following two lat/lon pairs (based on existing python app calc)
    private static final double TEST_DISTANCE = 48.31d;
    private static final double TEST_START_LAT = 40.58901;
    private static final double TEST_START_LON = -74.4754;
    private static final double TEST_END_LAT = 40.73061;
    private static final double TEST_END_LON = -73.935242;

    @Test
    public void testDistanceCalc() {

        double testDistance = Common.calculateDistance(TEST_START_LAT, TEST_START_LON, TEST_END_LAT, TEST_END_LON);
        assertEquals(TEST_DISTANCE, testDistance);

    }

    @Test
    public void TestDurationCalc() {

        Timestamp testStart = Timestamp.valueOf(TEST_START_DATE_TIME);
        Timestamp testEnd = Timestamp.valueOf(TEST_END_DATE_TIME);

        double minutes = Common.calculateDurationMinutes(testStart, testEnd);

        assertEquals(Double.valueOf(TEST_DURATION_MINUTES), minutes);
    }

    @Test
    public void TestSpeedCalc() throws InvalidValueException {

        Timestamp testStart = Timestamp.valueOf(TEST_START_DATE_TIME);
        Timestamp testEnd = Timestamp.valueOf(TEST_END_DATE_TIME);

        double speed = TEST_DISTANCE / (TEST_DURATION_MINUTES / 60d);

        double calculatedVelocity =
            Common.calculateVelocity(TEST_START_LAT, TEST_START_LON, testStart, TEST_END_LAT, TEST_END_LON, testEnd);

        assertEquals(speed, calculatedVelocity);
    }

    @Test
    public void BatteryValuesTest() throws InvalidValueException {

        String batteryStr = "45";
        Integer battery = 45;
        assertEquals(battery, Common.convertBatteryToInt(batteryStr));

        assertThrows(InvalidValueException.class, () -> Common.convertBatteryToInt("garbage"));
        assertThrows(InvalidValueException.class, () -> Common.convertBatteryToInt("-5"));
        assertThrows(InvalidValueException.class, () -> Common.convertBatteryToInt("110"));
    }

    @Test
    public void LatValuesTest() throws InvalidValueException {

        String latStr = "45.5";
        Double latitude = 45.5d;
        assertEquals(latitude, Common.convertLatToDouble(latStr));

        assertThrows(InvalidValueException.class, () -> Common.convertLatToDouble("garbage"));
        assertThrows(InvalidValueException.class, () -> Common.convertLatToDouble("-94"));
        assertThrows(InvalidValueException.class, () -> Common.convertLatToDouble("100"));
    }

    @Test
    public void LonValuesTest() throws InvalidValueException {

        String lonStr = "-73.5";
        Double longitude = -73.5d;
        assertEquals(longitude, Common.convertLonToDouble(lonStr));

        assertThrows(InvalidValueException.class, () -> Common.convertLonToDouble("garbage"));
        assertThrows(InvalidValueException.class, () -> Common.convertLonToDouble("-194"));
        assertThrows(InvalidValueException.class, () -> Common.convertLonToDouble("310"));
    }

}
