"""
Defines the transactions that are performed by movr.

This is where the python code meets the database.
"""

from uuid import uuid4

from sqlalchemy.orm import aliased
from sqlalchemy.sql.expression import func

from movr.models import LocationHistory, Ride, User, Vehicle


def start_ride_txn(session, vehicle_id, user_email):
    """
    Start a vehicle ride (or continue if the vehicle is already in use).

    Arguments:
        session {.Session} -- The active session for the database connection.
        vehicle_id {String} -- The vehicle's `id` column.
    """
    # find the row where we want to start the ride.
    # SELECT * FROM vehicles WHERE id = <vehicle_id> AND in_use = false
    #         LIMIT 1;
    vehicle = session.query(Vehicle).filter(Vehicle.id == vehicle_id). \
                                     filter(Vehicle.in_use == False).first()

    if vehicle is None:
        return None

    # SELECT * FROM location_history WHERE vehicle_id = <vehicle_id>
    #      ORDER BY ts DESC LIMIT 1;
    last_chx = session.query(LocationHistory). \
                       filter(LocationHistory.vehicle_id ==
                              vehicle_id). \
                       order_by(LocationHistory.ts.desc()). \
                       first()
    new_location_history_id = str(uuid4())
    new_timestamp = func.now()
    new_location_history_row = LocationHistory(id=new_location_history_id,
                                               vehicle_id=vehicle_id,
                                               longitude=last_chx.longitude,
                                               latitude=last_chx.latitude,
                                               ts=new_timestamp)

    new_ride_id = str(uuid4())
    new_ride_row = Ride(id=new_ride_id,
                        vehicle_id=vehicle_id,
                        user_email=user_email,
                        start_ts=new_timestamp,
                        end_ts=None)

    # UPDATE vehicles SET in_use = true WHERE vehicles.id = <vehicle_id>
    vehicle.in_use = True
    vehicle.last_checkin = func.now()
    session.add(new_location_history_row)
    session.flush()
    session.add(new_ride_row)

    return True  # Just making it explicit that this worked.


def end_ride_txn(session, ride_id, new_longitude, new_latitude,
                 new_battery):
    """
    Update a row of the rides table, and update a row of the vehicles table.

    Arguments:
        session {.Session} -- The active session for the database connection.
        vehicle_id {String} -- The vehicle's `id` column
        new_longitude {Float} -- The longitude where the ride ended
        new_latitude {Float} -- The latitude where the ride ended
        new_battery {Integer} -- The vehicle's battery % when the ride ended

    Returns:
        {Boolean} -- True if the ride ended.
    """
    ride = session.query(Ride).filter(Ride.id == ride_id).first()
    if ride is None:
        return False

    # find the vehicle
    vehicle = session.query(Vehicle).filter(Vehicle.id == ride.vehicle_id). \
                                     filter(Vehicle.in_use == True).first()

    if vehicle is None:
        return False

    # Prepare the new row for vehicle_history
    ride_end_time = str(func.now())
    new_history_entry = LocationHistory(id=str(uuid4()),
                                        vehicle_id=ride.vehicle_id,
                                        longitude=new_longitude,
                                        latitude=new_latitude,
                                        ts=ride_end_time)

    # Perform writes to end the ride
    ride.end_ts = ride_end_time
    vehicle.in_use = False
    vehicle.battery = new_battery
    session.add(new_history_entry)

    return True  # Make it explicit that this worked.


def add_vehicle_txn(session, vehicle_type, longitude, latitude, battery):
    """
    Insert a row into the vehicles table, and one into location_history.

    Does the equivalent of:

    # BEGIN;
    #
    #    INSERT INTO vehicles (id, battery, in_use, vehicle_type)
    #         VALUES (<vehicle_id>, 12, false, 'scooter')
    #    );
    #
    #    INSERT INTO location_history (id, vehicle_id, ts, longitude, latitude)
    #         VALUES (<uuid>, <vehicle_id>, now(), <longitude>, <latitude>);
    #
    # COMMIT;

    Arguments:
        session {.Session} -- The active session for the database connection.
        vehicle_type {String} -- The vehicle's type.
        longitude {Float}  -- Longitude of the vehicle.
        Latitude {Float} -- Latitude of the vehicle.
        battery {Int} -- Battery percantage remaining.

    Returns:
        {dict} -- The vehicle's new UUID and the location_history row's new
            UUID as {'vehicle_id': <UUID>, 'location_history_id': <UUID>}
    """
    vehicle_id = uuid4()
    current_time = func.now()
    location_history_id = uuid4()

    new_vehicle_row = Vehicle(id=str(vehicle_id),
                              in_use=False,
                              vehicle_type=vehicle_type,
                              battery=battery)
    new_location_history_row = LocationHistory(id=str(location_history_id),
                                               vehicle_id=str(vehicle_id),
                                               longitude=longitude,
                                               latitude=latitude,
                                               ts=current_time)

    session.add(new_vehicle_row)
    session.flush()  # can't let the next row get inserted first.
    session.add(new_location_history_row)

    return {"vehicle_id": str(vehicle_id),
            "location_history_id": str(location_history_id)}


def remove_vehicle_txn(session, vehicle_id):
    """
    Delete a row of the vehicles table.

    Arguments:
        session {.Session} -- The active session for the database connection.
        id {UUID} -- The vehicle's unique ID.

    Returns:
        {None} -- vehicle isn't found
        True {Boolean} -- vehicle is deleted
    """
    # find the row.
    # SELECT * FROM vehicles WHERE id = <vehicle_id> AND in_use = false;
    vehicle = session.query(Vehicle).filter(Vehicle.id == vehicle_id). \
                                     filter(Vehicle.in_use == False).first()

    if vehicle is None:  # Either vehicle is in use or it's been deleted
        return None

    # Cascades the delete through location_history on vehicle_id automatically.
    session.query(Vehicle).filter(Vehicle.id == vehicle_id).delete()

    return True  # Should return True when vehicle is deleted.


def find_most_recent_timestamp_subquery(session):
    """
    Subquery to find only the most recent location_histroy entry.

    Can join to location_history to find the most recent row for any
        vehicle.

    Not for use outside of transactions.py
    """
    # (SELECT vehicle_id, MAX(ts) AS max_ts FROM location_history
    #   GROUP BY vehicle_id) AS g
    l = LocationHistory
    g = session.query(l.vehicle_id, func.max(l.ts).label("max_ts")). \
                group_by(l.vehicle_id).subquery()
    return g


def get_vehicles_txn(session, max_records):
    """
    Select all rows of the vehicles table.

    * Updated for two-table schema (vehicles & location_history).
    * Single-table query was session.query(Vehicle).limit(max_records).all()

    Was previously
    --------------

    SELECT * FROM vehicles LIMIT <max_records>;

    Now is equivalent to
    --------------------

    SELECT
        v.id AS id,
        v.in_use AS in_use,
        v.vehicle_type AS vehicle_type,
        v.battery AS battery,
        l.ts AS last_checkin,
        l.latitude AS last_latitude,
        l.longitude AS last_longitude
    FROM
        vehicles AS v
    INNER JOIN
        location_history AS l
            ON v.id = l.vehicle_id
    INNER JOIN
        (
            SELECT
                vehicle_id,
                MAX(ts) AS max_ts
            FROM
                location_history
            GROUP BY
                vehicle_id
        ) AS g
            ON g.vehicle_id = l.vehicle_id
            AND g.MaxTS = l.ts
    ORDER BY v.id
    LIMIT max_records;

    * Updated for two-table schema (vehicles & location_history).
    * Single-table query was session.query(Vehicle).limit(max_records).all()

    Arguments:
        session {.Session} -- The active session for the database connection.
        max_records {Integer} -- Limits the number of records returned.

    Returns:
        {list} -- A list of dictionaries containing vehicle information.
    """
    v = aliased(Vehicle)  # vehicles AS v
    l = aliased(LocationHistory)  # location_history as l

    # (SELECT vehicle_id, MAX(g.ts) AS max_ts FROM location_history
    g = find_most_recent_timestamp_subquery(session)

    vehicles = session.query(v.id, v.in_use, v.vehicle_type, v.battery,
                             l.longitude, l.latitude, l.ts). \
                       filter(l.vehicle_id == v.id). \
                       join(g). \
                       filter(g.c.vehicle_id == l.vehicle_id). \
                       filter(g.c.max_ts == l.ts). \
                       order_by(v.id). \
                       limit(max_records). \
                       all()

    # Return the results in a form that will persist.
    return list(map(lambda vehicle: {'id': str(vehicle.id),
                                     'last_longitude': vehicle.longitude,
                                     'last_latitude': vehicle.latitude,
                                     'last_checkin': vehicle.ts,
                                     'in_use': vehicle.in_use,
                                     'battery': vehicle.battery,
                                     'vehicle_type': vehicle.vehicle_type},
                    vehicles))


def get_vehicle_txn(session, vehicle_id):
    """
    For when you just want a single vehicle.

    * Designed for two-table schema (vehicles & location_history).
    * Previous version's query was
      `session.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    Arguments:
        session {.Session} -- The active session for the database connection.
        vehicle_id {String} -- The vehicle's `id` column.

    Returns:
        {dict} or {None} -- Contains vehicle information for the vehicle
                                queried, or None of no vehicle found.
    """
    v = aliased(Vehicle)  # vehicles AS v
    l = aliased(LocationHistory)  # location_history as l
    g = find_most_recent_timestamp_subquery(session)

    # SELECT columns
    vehicle = session.query(v.id, v.in_use, v.vehicle_type, v.battery,
                            l.longitude, l.latitude, l.ts). \
                      filter(l.vehicle_id == v.id). \
                      filter(l.vehicle_id == vehicle_id). \
                      join(g). \
                      filter(g.c.vehicle_id == l.vehicle_id). \
                      filter(g.c.max_ts == l.ts).order_by(v.id). \
                      first()  # LIMIT 1;

    # Return the row as a dictionary for flask to populate a page.
    if vehicle is None:
        return None

    return {'id': str(vehicle.id), 'last_longitude': vehicle.longitude,
            'last_latitude': vehicle.latitude, 'last_checkin': vehicle.ts,
            'in_use': vehicle.in_use, 'battery': vehicle.battery,
            'vehicle_type': vehicle.vehicle_type}


def get_vehicle_and_location_history_txn(session, vehicle_id, max_locations):
    """
    Gets not just the vehicle, but its recent location history.

    Locations ordered by time, starting from most recent.

    Inputs
    ------

    vehcile_id (str(uuid)) - vehicle identifier
    max_locations - maximum number of location_history rows to return
    """
    vehicle = session.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    locations = session.query(LocationHistory). \
                        filter(LocationHistory.vehicle_id == vehicle_id). \
                        order_by(LocationHistory.ts.desc()). \
                        limit(max_locations). \
                        all()

    vehicle_info = {"id": vehicle.id,
                    "in_use": vehicle.in_use,
                    "battery": vehicle.battery,
                    "vehicle_type": vehicle.vehicle_type}

    location_history = list(map(
        lambda location: {'longitude': location.longitude,
                          'latitude': location.latitude, 'ts': location.ts},
        locations))
    return (vehicle_info, location_history)


def parse_phone_numbers(phone_number_string):
    """
    
    Arguments:
        phone_number_string {String} -- Phone number or numbers, as input by
            the user at registration. Commas separate phone numbers.

    Returns:
        phone_numbers {List} -- One string element per user phone number.
    """
    phone_numbers = [phone_number.strip()
                     for phone_number in phone_number_string.split(',')]
    return phone_numbers


def add_user_txn(session, email, last_name, first_name, phone_numbers):
    """
    Add a new row to the User table.

    Does not currently validate phone numbers, beyond confirming that it's an
        array of strings.

    Arguments:
        email {String} -- The user's email.
        first_name {String} -- The user's first name.
        last_name {String} -- The user's last name.
        phone_numbers {Array} {String} -- The user's phone numbers, stored as
            strings. Empty array is OK.
    """
    phone_numbers = parse_phone_numbers(phone_numbers)
    user = User(email=email, last_name=last_name, first_name=first_name,
                phone_numbers=phone_numbers)
    session.add(user)

    return True


def get_user_txn(session, email):
    """
    Get a user.

    Arguments:
        email {String} -- The user's email.

    Returns:
        user {User} -- The user's row from the database.
            Note that, unlike all other *_txn() functions, this does not map
            the object returned by the query to a dictionary.
    """
    user = session.query(User).filter(User.email == email).first()
    if user is None:  # No record found
        return None

    else:
        session.expunge(user)  # detatch User instance from the session

    return user


def get_rides_by_user_txn(session, email):
    """
    Finds every ride a user has ever taken.
    """
    r = aliased(Ride)
    v = aliased(Vehicle)
    rides = session.query(r.vehicle_id, v.vehicle_type, r.start_ts, r.end_ts). \
                    filter(r.user_email == email). \
                    filter(v.id == r.vehicle_id). \
                    order_by(r.start_ts.desc()).all()
    return list(map(lambda ride: {'vehicle_id': ride.vehicle_id,
                                  'vehicle_type': ride.vehicle_type,
                                  'start_ts': ride.start_ts,
                                  'end_ts': ride.end_ts}, rides))


def remove_user_txn(session, email):
    """
    Deletes a user from the database.

    Arguments:
        email {UUID} -- user's email.
    """
    session.query(User).filter(User.email == email).delete()

    return True


def get_active_ride_txn(session, vehicle_id, email):
    """
    Finds the ride
    """
    try:
        ride, vehicle, start_location = session.query(Ride, Vehicle,
                                                      LocationHistory). \
                filter(Ride.vehicle_id == vehicle_id). \
                filter(Ride.user_email == email). \
                filter(Ride.end_ts == None). \
                filter(Vehicle.id == Ride.vehicle_id). \
                filter(Vehicle.in_use == True). \
                filter(LocationHistory.vehicle_id == vehicle_id). \
                filter(LocationHistory.ts == Ride.start_ts). \
                first()
    except TypeError:  # Criteria not met for both ride & vehicle
        return None

    return {"id": str(ride.id),
            "vehicle_id": vehicle.id,
            "vehicle_battery": vehicle.battery,
            "vehicle_type": vehicle.vehicle_type,
            "start_longitude": start_location.longitude,
            "start_latitude": start_location.latitude,
            "start_time": ride.start_ts}
