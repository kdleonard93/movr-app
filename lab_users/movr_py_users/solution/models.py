"""
Aligns sqlalchemy's schema for the "vehicles" table with the database.
"""

from sqlalchemy import (ARRAY, Boolean, Column, DateTime, Float, ForeignKey,
                        Integer, PrimaryKeyConstraint, String)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql.expression import func
from flask_login import UserMixin

Base = declarative_base()


class Vehicle(Base):
    """
    DeclarativeMeta class for the vehicles table.

    Arguments:
        Base {DeclarativeMeta} -- Base class for model to inherit.
    """
    __tablename__ = 'vehicles'
    id = Column(UUID)
    in_use = Column(Boolean)
    vehicle_type = Column(String)
    battery = Column(Integer)
    PrimaryKeyConstraint(id)

    def __repr__(self):
        return "<Vehicle(id='{0}', vehicle_type='{1}')>".format(
            self.id, self.vehicle_type)


class LocationHistory(Base):
    """
    Table object to store a vehicle's location_history.

    Arguments:
        Base {DeclarativeMeta} -- Base class for declarative SQLAlchemy class
                that produces appropriate `sqlalchemy.schema.Table` objects.
    """
    __tablename__ = 'location_history'
    id = Column(UUID)
    vehicle_id = Column(UUID, ForeignKey('vehicles.id'))
    ts = Column(DateTime, default=func.now)
    longitude = Column(Float)
    latitude = Column(Float)
    PrimaryKeyConstraint(id)

    def __repr__(self):
        return (("<Vehicle(id='{0}', vehicle_id='{1}', ts='{2}', "
                 "longitude='{3}', latitude='{4}')>"
                 ).format(self.id, self.vehicle_id, self.ts, self.longitude,
                          self.latitude))


class User(Base, UserMixin):
    """
    Stores information about the user.

    Arguments:
        Base {DeclarativeMeta} -- Base class for declarative SQLAlchemy class
                that produces appropriate `sqlalchemy.schema.Table` objects.
        UserMixin {UserMixin} -- Mixin object that provides default
            implementations for the methods that Flask-Login expects user objects
            to have.
    """
    # Next six lines are the solution to the lab.
    __tablename__ = 'users'
    email = Column(String)
    last_name = Column(String)
    first_name = Column(String)
    phone_numbers = Column(ARRAY(String))
    PrimaryKeyConstraint(email)

    def get_id(self):
        """
        Required by flask_login.

        Creating User.get_id() in order to eliminate the need for User.id
        """
        return self.email

    def __repr__(self):
        return (("<User(email='{0}', last_name='{1}', first_name='{2}', "
                 ")>").format(self.email, self.last_name, self.first_name))


class Ride(Base):
    """
    Stores information about rides.

    Arguments:
        Base {DeclarativeMeta} -- Base class for declarative SQLAlchemy class
                that produces appropriate `sqlalchemy.schema.Table` objects.

    """
    # Next six lines are the solution to the lab.
    __tablename__ = 'rides'
    id = Column(UUID)
    vehicle_id = Column(UUID, ForeignKey('vehicles.id'))
    user_email = Column(String, ForeignKey('users.email'))
    start_ts = Column(DateTime)
    end_ts = Column(DateTime)
    PrimaryKeyConstraint(id)

    def __repr__(self):
        return (("<Ride(id='{0}', vehicle_id='{1}', user_email='{2}', "
                 "start_ts='{3}', end_ts='{4}')>"
                 ).format(self.id, self.vehicle_id, self.user_email,
                          self.start_ts, self.end_ts))
