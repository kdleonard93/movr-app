#!/usr/bin/env python3
"""
Runs the MovR web server on your local machine.

Uses the .env file from the current directory to supplement
    environment variables while running.

Usage:
    ./server.py run [options]
    ./server.py --help

Options:
    -h --help               Show this text.
    --port <port>           Port where the server listens for requests.
                                [default: 36257]
    --url <url>             CockroachDB connection string. If none, it will use
                                the .env file or the DB_URL environment
                                variable.
    --max-records <number>  Maximum number of records to query when no filter
                                is specified [default: 20]
"""

from docopt import docopt
from flask import (Flask, flash, Markup, redirect, render_template,
                   send_from_directory, session, url_for)
from flask_bootstrap import Bootstrap, WebCDN
from flask_login import (LoginManager, current_user, login_user, logout_user,
                         login_required)
from sqlalchemy.exc import IntegrityError, ProgrammingError, DBAPIError

from movr.movr import MovR
from util.calculations import generate_end_ride_messages
from util.connect_with_sqlalchemy import (build_sqla_connection_string,
                                          test_connection)
from util.exception_handling import render_error_page
from web.config import Config
from web.forms import (EndRideForm, ViewRideForm, LoginForm, RegisterForm,
                       RemoveUserForm, RemoveVehicleForm, SeeVehicleForm,
                       StartRideForm, VehicleForm)

# Initialize the web server app & load bootstrap
app = Flask(__name__)
Bootstrap(app)
login = LoginManager(app)

# Parse the command line options
_opts = docopt(__doc__)
_PORT = int(_opts['--port'])
_URL = _opts['--url']
_MAX_RECORDS = _opts['--max-records']
_DEFAULT_ROUTE_AUTHENTICATED = "vehicles"
_DEFAULT_ROUTE_NOT_AUTHENTICATED = "login_page"

# Configure the app
app.config.from_object(Config)

if _URL is None:  # No --url flag; check for environment variable DB_URI
    environment_connection_string = app.config.get('DB_URI')
    CONNECTION_STRING = build_sqla_connection_string(
        environment_connection_string)
else:  # url was passed with `--url`
    CONNECTION_STRING = build_sqla_connection_string(_URL)
# Load environment variables from .env file

# Instantiate the movr object defined in movr/movr.py
movr = MovR(CONNECTION_STRING, max_records=_MAX_RECORDS)

app.extensions['bootstrap']['cdns']['bootstrap'] = WebCDN(
    '//getbootstrap.com/docs/4.5/dist/'
)

# Verify connection to database is working.
# Suggest help if common errors are encountered.
test_connection(movr.engine)


# ROUTES
# Home page
@app.route('/', methods=['GET'])
def home_page():
    """
    Redirects to appropriate default page.
    """
    session['riding'] = None
    if current_user.is_authenticated:
        return redirect(url_for(_DEFAULT_ROUTE_AUTHENTICATED, _external=True))

    return redirect(url_for(_DEFAULT_ROUTE_NOT_AUTHENTICATED, _external=True))


# Define user_loader function for LoginManager
@login.user_loader
def load_user(email):
    """
    Gets a User object for the LoginManager
    """
    return movr.get_user(email)


# User page
@app.route('/profile', methods=['GET'])
@login_required
def profile():
    """
    Displays the user's User Profile page.
    """
    remove_user_form = RemoveUserForm()
    if current_user.is_authenticated:
        return render_template('user.html',
                               title='{0} {1}'.format(current_user.first_name,
                                                      current_user.last_name),
                               remove_user_form=remove_user_form,
                               API_KEY=app.config.get('API_KEY'))
    flash('You need to log in to see your profile!')
    return redirect(url_for('login_page', _external=True))


# Rides page
@app.route('/rides', methods=['GET'])
@login_required
def rides():
    """All rides a user has taken.
    """
    users_rides = movr.get_rides_by_user(current_user.email)
    for ride in users_rides:
        if ride['end_ts'] is None:
            session['riding'] = True
            break

    return render_template('rides.html',
                           title='Rides',
                           rides=users_rides,
                           riding=session['riding'],
                           form=ViewRideForm(),
                           API_KEY=app.config.get('API_KEY'))


# Login page
@app.route('/login', methods=['GET', 'POST'])
def login_page():
    """Lets the user log in."""
    if current_user.is_authenticated:
        return redirect(url_for(_DEFAULT_ROUTE_AUTHENTICATED, _external=True))
    form = LoginForm()
    if form.validate_on_submit():
        user = movr.get_user(email=form.email.data)
        if user is None:
            flash(
                Markup('Invalid user credentials.<br>If you aren\'t '
                       'registered with MovR, go <a href="{0}">'
                       'Sign Up</a>!'
                       ).format(url_for('register', _external=True)))
            return redirect(
                url_for('login_page', _external=True))
        login_user(user)
        return redirect(
            url_for(_DEFAULT_ROUTE_AUTHENTICATED, _external=True))
    return render_template('login.html',
                           title='Log In',
                           form=form)


# Logout route
@app.route('/logout')
@login_required
def logout():
    """User logs out."""
    logout_user()
    session['riding'] = None
    flash('You have successfully logged out.')
    return redirect(url_for(_DEFAULT_ROUTE_NOT_AUTHENTICATED, _external=True))


# Registration page
@app.route('/register', methods=['GET', 'POST'])
def register():
    """Register as a new user."""
    if current_user.is_authenticated:
        flash("Cannot register a new user while logged in.")
        return redirect(url_for(_DEFAULT_ROUTE_AUTHENTICATED, _external=True))
    form = RegisterForm()
    if form.validate_on_submit():
        logout_user()  # Sometimes required to kill an old session
        email = form.email.data
        last_name = form.last_name.data
        first_name = form.first_name.data
        phone_numbers = form.phone_number.data
        try:
            if movr.add_user(email=email, last_name=last_name,
                             first_name=first_name,
                             phone_numbers=phone_numbers):
                # Check to see if lab is complete
                if movr.get_user(email) is not None:
                    flash(('Registration successful! You can now log in as '
                           '`{}`.').format(email))
                    return redirect(
                        url_for('login_page', _external=True))
                else:
                    flash("User registration failed. Please compete "
                          "`Lab: Adding Users to MovR` and try again.")
                    return redirect(url_for('register', _external=True))

            else:
                flash(('add_user_txn(session, "{email}", "{last_name}", '
                       '"{first_name}", "{phone_numbers}") failed for unknown '
                       'reasons. Please copy this message and send it to '
                       'univeristy@cockroachlabs.com for analysis.'
                       ).format(email=email,
                                last_name=last_name,
                                first_name=first_name,
                                phone_numbers=phone_numbers))
        except DBAPIError as sql_error:
            flash(('Registration failed. Make sure that you choose '
                   'a unique email!'))
            flash(('{0}'.format(sql_error)))
            return redirect(
                url_for('register', _external=True))
    return render_template('register.html',
                           title='Sign Up',
                           form=form)


# Remove user route
@app.route('/user/delete', methods=['POST'])
@login_required
def remove_user():
    """
    Deletes the user from the database.
    """
    movr.remove_user(current_user.email)
    logout_user()
    session['riding'] = None
    flash('You have successfully deleted your account.')
    return redirect(url_for(_DEFAULT_ROUTE_NOT_AUTHENTICATED, _external=True))


# Vehicles page
@app.route('/vehicles', methods=['GET'])
@login_required
def vehicles(max_vehicles=_MAX_RECORDS):
    """
    Shows the vehicles page, listing all vehicles.
    """
    try:
        start_ride_form = StartRideForm()
        see_vehicle_form = SeeVehicleForm()
        some_vehicles = movr.get_vehicles(max_vehicles=max_vehicles)
        return render_template('vehicles.html',
                               title='Vehicles',
                               vehicles=some_vehicles,
                               start_ride_form=start_ride_form,
                               see_vehicle_form=see_vehicle_form)
    except ProgrammingError as error:
        return render_error_page(error, movr)


# Single vehicle page
@app.route('/vehicle/<vehicle_id>', methods=['GET', 'POST'])
@login_required
def vehicle(vehicle_id):
    """View information for a single vehicle."""
    start_ride_form = StartRideForm()
    remove_vehicle_form = RemoveVehicleForm()
    this_vehicle, location_history = movr.get_vehicle_and_location_history(
        vehicle_id, max_locations=_MAX_RECORDS)
    if this_vehicle is None:
        flash("Vehicle `{}` not found.".format(vehicle_id))
        return redirect(url_for('vehicles', _external=True))
    return render_template('vehicle.html',
                           title='Vehicle {}'.format(vehicle_id),
                           vehicle=this_vehicle,
                           locations=location_history,
                           start_ride_form=start_ride_form,
                           remove_vehicle_form=remove_vehicle_form)


# Remove a vehicle
@app.route('/vehicle/remove/<vehicle_id>', methods=['POST'])
@login_required
def remove_vehicle(vehicle_id):
    """Delete a vehicle from the database."""
    vehicle_deleted = movr.remove_vehicle(vehicle_id)
    if vehicle_deleted:  # Vehicle looks like it was deleted
        # Verify that it was actually deleted as required by the lab.
        if movr.get_vehicle(vehicle_id) is None:  # Vehicle looks deleted
            flash("Deleted vehicle with id "
                  "`{id}` from database.".format(id=vehicle_id))
            return redirect(url_for('vehicles', _external=True))
        # else vehicle is still in the database.
        flash(("Vehicle `{}` not successfully deleted. Please modify "
               "remove_vehicle_txn in `movr/transactions.py` to implement "
               "the correct functionality."
               ).format(vehicle_id))
        return redirect(url_for('vehicle', vehicle_id=vehicle_id,
                                _external=True))
    elif vehicle_deleted is None:  # Vehicle in use or not in database
        flash(("Vehicle `{}` not found in database or not in use. "
               "Cannot delete it.").format(vehicle_id))
        return redirect(url_for('vehicles', _external=True))

    return render_error_page(RuntimeError(
        ("Attempt to remove vehicle hit unexpected state. "
         "Please notify university@cockroachlabs.com via email of this error "
         "message. Attempted to remove vehicle `{vehicle_id}`. "
         "Current row state is `{row}`."
         ).format(vehicle_id=vehicle_id,
                  row=movr.get_vehicle(vehicle_id))),
                             movr)


# Start ride route
@app.route('/ride/start/<vehicle_id>', methods=['POST'])
@login_required
def start_ride(vehicle_id):
    """
    When the user clicks "start ride," perform DB op & redirect to ride page.
    """
    user_email = session.get('_user_id')
    if movr.start_ride(vehicle_id, user_email):
        flash('Ride started with vehicle {}.'.format(vehicle_id))
        return redirect(url_for('ride', vehicle_id=vehicle_id, _external=True))
    flash('Could not start ride on vehicle {}.'.format(vehicle_id))
    flash('Either the vehicle is actively being ridden, or it has been '
          'deleted from the database.')
    return redirect(url_for('vehicles', _external=True))


# Ride page
@app.route('/ride/<vehicle_id>', methods=['GET', 'POST'])
@login_required
def ride(vehicle_id):
    """
    Show the user the form to end a ride.
    """
    form = EndRideForm()
    user_ride = movr.get_active_ride(vehicle_id, current_user.email)
    if user_ride is None:  # No ride found for vehicle
        flash("Cannot view the ride for this vehicle. It is not currently in "
              "use, or you are not the rider.")
        return redirect(url_for('vehicle', vehicle_id=vehicle_id,
                                _external=True))

    vehicle_at_start = {"id": vehicle_id,
                        "battery": user_ride["vehicle_battery"],
                        "vehicle_type": user_ride["vehicle_type"],
                        "last_longitude": user_ride["start_longitude"],
                        "last_latitude": user_ride["start_latitude"],
                        "last_checkin": user_ride["start_time"]}

    if form.validate_on_submit():
        if movr.end_ride(user_ride["id"], form.longitude.data,
                         form.latitude.data, form.battery.data):
            vehicle_at_end = movr.get_vehicle(vehicle_id)
            for message in generate_end_ride_messages(vehicle_at_start,
                                                      vehicle_at_end):
                flash(message)
            return redirect(url_for('vehicle', vehicle_id=vehicle_id,
                                    _external=True))
        # else: end_ride didn't work
        flash("Unable to end ride for vehicle `{id}`.".format(id=vehicle_id))
        return redirect(url_for('ride', vehicle_id=vehicle_id, _external=True))
    return render_template('ride.html',
                           title=('Riding a {}'
                                  ).format(vehicle_at_start["vehicle_type"]),
                           form=form, vehicle=vehicle_at_start, _external=True)


# Add vehicles route
@app.route('/vehicles/add', methods=['GET', 'POST'])
@login_required
def add_vehicle():
    """Add a new vehicle to the fleet."""
    form = VehicleForm()
    if form.validate_on_submit():
        vehicle_type = form.vehicle_type.data
        try:
            new_info = movr.add_vehicle(vehicle_type=vehicle_type,
                                        longitude=form.longitude.data,
                                        latitude=form.latitude.data,
                                        battery=form.battery.data)
        except IntegrityError as e:
            return render_error_page(e, movr)
        vehicle_id = new_info['vehicle_id']

        # check to verify that vehicle was added
        new_vehicle = movr.get_vehicle(vehicle_id)
        if new_vehicle is None:  # Insert didn't work
            flash(("Vehicle with id `{}` "
                   "NOT successfully added. Edit add_vehicle_txn in "
                   "movr/transactions.py to add the vehicle to the database."
                   ).format(vehicle_id))
            redirect(url_for('add_vehicle', _external=True))
        else:  # Inserted vehicle was found
            flash('Vehicle added! \nid: {}'.format(vehicle_id))
            return redirect(
                url_for('vehicle', vehicle_id=vehicle_id, _external=True))

    # form not properly filled out yet
    return render_template('add_vehicle.html',
                           title='Add a vehicle',
                           form=form)


if __name__ == '__main__':
    app.run(use_reloader=False, port=_PORT)
