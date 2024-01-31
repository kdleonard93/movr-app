"""
Defines the connection to the database for the MovR app.
"""
from sqlalchemy_cockroachdb import run_transaction
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from movr.transactions import (add_user_txn, add_vehicle_txn, end_ride_txn,
                               get_active_ride_txn, get_rides_by_user_txn,
                               get_user_txn, get_vehicle_txn, get_vehicles_txn,
                               remove_user_txn, remove_vehicle_txn,
                               start_ride_txn,
                               get_vehicle_and_location_history_txn)


class MovR:
    """
    Wraps the database connection. The class methods wrap transactions.
    """
    def __init__(self, conn_string, max_records=20):
        """
        Establish a connection to the database, creating an Engine instance.

        Arguments:
            conn_string {String} -- CockroachDB connection string.
        """
        self.engine = create_engine(conn_string, echo=True)
        self.connection_string = conn_string
        self.max_records = max_records
        self.sessionfactory = sessionmaker(bind=self.engine)

    def start_ride(self, vehicle_id, user_email):
        """
        Wraps a `run_transaction` call that starts a ride.

        Arguments:
            vehicle_id {UUID} -- The vehicle's unique ID.
        """
        return run_transaction(
            self.sessionfactory,
            lambda session: start_ride_txn(session, vehicle_id, user_email))

    def end_ride(self, ride_id, new_longitude, new_latitude, new_battery):
        """
        Wraps a `run_transaction` call that ends a ride.

        Updates position (lat & long), battery & timestamp.

        Arguments:
            ride_id {UUID}
            new_longitude {float} -- Vehicle's new longitude coordinate
            new_latitude {float} -- Vehicle's new latitude coordinate
            new_battery {int} -- Vehicle's new battery reading

        Returns:
            {datetime} -- Timestamp of the end of the ride from the server.
        """
        return run_transaction(
            self.sessionfactory,
            lambda session: end_ride_txn(session, ride_id, new_longitude,
                                         new_latitude, new_battery))

    def remove_vehicle(self, vehicle_id):
        """
        Wraps a `run_transaction` call that "removes" a vehicle.

        Arguments:
            id {UUID} -- The vehicle's unique ID.
        """
        return run_transaction(
            self.sessionfactory,
            lambda session: remove_vehicle_txn(session, vehicle_id))

    def add_vehicle(self, vehicle_type, longitude, latitude, battery):
        """
        Wraps a `run_transaction` call that adds a vehicle.

        Arguments:
            vehicle_type {String} -- The type of vehicle.
        """
        return run_transaction(self.sessionfactory,
                               lambda session: add_vehicle_txn(session,
                                                               vehicle_type,
                                                               longitude,
                                                               latitude,
                                                               battery))

    def get_vehicles(self, max_vehicles=None):
        """
        Wraps a `run_transaction` call that gets all vehicle.

        Returns:
            A list of dictionaries containing vehicle data.
        """
        if max_vehicles is None:
            max_vehicles = self.max_records

        return run_transaction(
            self.sessionfactory,
            lambda session: get_vehicles_txn(session, max_vehicles))

    def get_vehicle(self, vehicle_id):
        """
        Get a single vehicle from its id.
        """
        return run_transaction(self.sessionfactory,
                               lambda session: get_vehicle_txn(session,
                                                               vehicle_id))

    def get_vehicle_and_location_history(self, vehicle_id, max_locations=None):
        """
        Gets vehicle info AND recent locations.

        Inputs
        ------

        vehicle_id (str(uuid)): ID of the vehicle we want
        max_locations (int): Number of points in location_history to show

        Returns
        -------

        (vehicle (dict), location_history (list(dict))):

          vehicle: dictionary representation of the row of the vehicles table
          location_history: list of dictionaries, each representing a row in
              location_history, ordered by timestamp starting at most recent.
        """
        if max_locations is None:
            max_locations = self.max_records

        return run_transaction(
            self.sessionfactory,
            lambda session: get_vehicle_and_location_history_txn(
                session, vehicle_id, max_locations))

    def add_user(self, email, last_name, first_name, phone_numbers):
        """
        Wraps a `run_transaction` call that adds a user.

        Arguments:
            email {String} -- The user's email.
            first_name {String} -- The user's first name.
            last_name {String} -- The user's last name.
            phone_numbers {String} -- The user's phone numbers.
        """
        return run_transaction(
            self.sessionfactory,
            lambda session: add_user_txn(session, email, last_name,
                                         first_name, phone_numbers))

    def get_user(self, email):
        """
        Wraps a `run_transaction` call that gets a User object.

        # NOTE: THE FOLLOWING MAY NEED TO GET MODIFIED:
        #     As a required function for LoginManager, the function must take
        #     the `user_id` argument, and return a User object.

        Keyword Arguments:
            email {String} -- The user's email. (default: {None})

        Returns:
            User -- A User dict.
        """
        return run_transaction(
            self.sessionfactory,
            lambda session: get_user_txn(session, email))

    def get_rides_by_user(self, email):
        """
        Wraps a `run_transaction` call that gets rides for a user.

        Arguments:
            user_email {String} -- The user's email address.

        Returns:
            List -- A list of dictionaries containing ride data.
        """
        return run_transaction(
            self.sessionfactory,
            lambda session: get_rides_by_user_txn(session, email))

    def remove_user(self, email):
        """
        Wraps a `run_transaction` call that "removes" a user.

        Arguments:
            user_email {String} -- The user's email address.
        """
        return run_transaction(
            self.sessionfactory,
            lambda session: remove_user_txn(session, email))

    def get_active_ride(self, vehicle_id, email):
        """
        Finds the active ride for a vehicle.
        """
        return run_transaction(self.sessionfactory,
                               lambda session: get_active_ride_txn(
                                   session, vehicle_id, email))

    def show_tables(self):
        """
        Returns:
            List -- A list of tables in the database it's connected to.
        """
        return self.engine.table_names()
