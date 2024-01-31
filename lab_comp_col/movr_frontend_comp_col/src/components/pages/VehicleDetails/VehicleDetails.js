import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./index.css";
import axios from "axios";
import { connect } from "react-redux";
import { removedVehicle, resetDash } from "../../../redux/actions";
import { Alert } from "reactstrap";
import moment from "moment";


/**
 * Initiation function for the VehicleDetails component
 */
const VehicleDetails = ({
  match,
  email,
  removedVehicle,
  newVehicleID,
  RideEndDetails,
  resetDash,
}) => {
  /* Initialize state variables for user, vehicles.id, and ride
   * Note: need to modify the name of the `usersinfo` variable, as it's 
   * actually the vehicle's entire JSON object passed back by the REST API.
   * Has nothing to do with the user.
   */
  const [usersinfo, setusersinfo] = useState("");
  const [id, setid] = useState("");
  const [addRide, setaddRide] = useState("");

  /**
   * This UseEffect function is where set the current vehicle id and retrieve
   * the data
   */
  useEffect(() => {
    // match.params.id is the vehicles.id field in the db, and is set in the
    // url. We are grabbing it and using it on the vehicle details page.
    setid(match.params.id);
    if (newVehicleID != "") {
      setaddRide(true);
    } else {
      setaddRide(false);
    }

    // REST request to retrieve the selected vehicle's details.
    axios
      .get("/api/vehicles/" + match.params.id)
      .then(function (response) {
        // Remember, usersinfo is actually the entire REST response for the
        // vehicle.
        setusersinfo(response.data);
      })
      .catch(function (error) {
        console.log('Exception caught and ignored. \n' +
                    'tag: 04c7e810-1382-4943-8b92-d4b0a9643409\n' +
                    'error: {error}\n\n' +
                    'Message: {error.message}')
      })
      .then(function (response) {
        /* Setting a timeout to allow popup time to display briefly
         * Actual display is at most this amount (seems to often be less).
         * Bug: this should be displayed until the user clicks on a new page
         */
        setTimeout(() => {
          setaddRide(false);
          resetDash();
        }, 10000);
      });

    setTimeout(() => {
      resetDash();
    }, 10000);
  }, []);

  /*
   * Click event handler to delete the current vehicle.
   */
  const deleteVehicle = () => {
    // API call to delete the vehicle, triggered by the click.
    axios
      .delete("/api/vehicles/" + match.params.id + "/delete")
      // Currently throwing away the response
      // Bug: we should be using this to determine what to load/display next.
      .then(function (response) {})
      .then(function () {
        /* call to redux store to remove a vehicle using the vehicle id.
         * This gets used in Dashboard.js to construct a deleted vehicle
         * message.
         */
        removedVehicle(match.params.id);
      })
      /* Overloading the id on error to flag that an error has occurred.
       * This will trigger for ANY error, but this assumes it's an HTML 409
       * code. This object finds its way to 
       * src/components/pages/Dashboard/Dashboard.js as the vehicleID field,
       * parsed to define the vehicleDeletedAlert that gets flashed on the
       * vehicles/ page after you click the "delete vehicle" button.
       * I'm sorry. -Will
       */
      .catch(function (error) {
        removedVehicle("NOT DELETED: " + match.params.id);
        console.log("Generic error caught and assumed to be a vehicle that" +
                    "was not deleted because it is in use.\n" +
                    "error: {error}\n\n" +
                    "message: {error.message}");
      });
  };

  // This is click event handler to start the ride.
  const startRide = () => {
    try {
      // http request to start a ride based on its user email and vehicles id
      axios.post("/api/rides/start", {
        email: email,
        vehicle_id: id,
      });
    } catch (err) {
      console.log('Exception caught and ignored. \n' +
                  'tag: 1c9181a1-f39e-470c-99a2-f39dd8869fd1\n' +
                  'error: {err}\n\n' +
                  'Message: {err.message}');
    }
  };

  /** Bug: shouldn't go blank if there's no usersinfo.
   *  Remember, usersinfo is actually the vehicle's info from the REST api call
   *  to /vehicledetails/<vehicle_id>
   */
  return !usersinfo ? null : (
    <div style={{ margin: "20px", textAlign: "center" }}>
      <h1>Vehicle {usersinfo.id}</h1>
      <div className="container">

    {/* Both of these alerts flash messages passed if the "end ride" form was
      * just submitted. They are constructed by the back end, and tell the
      * user about the ride (that it ended, how far they went, their average
      * velocity, etc.).  RideEndDetails is set in RideDetails.js when the
      * POST call to `/api/rides/end` is performed and the redux action
      * function rideEndedDetails() is passed the message.
      */ }
        <Alert
          color="warning"
          style={{ padding: "20px" }}
          isOpen={RideEndDetails.length > 0}>
          {RideEndDetails[0]}
        </Alert>

        <Alert
          color="warning"
          style={{ padding: "20px" }}
          isOpen={RideEndDetails.length > 0}>
          {RideEndDetails[1]}
        </Alert>

    {/*
      * Alert flashed if a new vehicle was successfully added.
      */ }
        <Alert color="warning" style={{ padding: "20px" }} isOpen={addRide}>
          Vehicle added id: {newVehicleID}
        </Alert>

      </div>
      <div
        key={usersinfo.id}
        className="col-lg-4 col-md-6 col-lg-6 container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          marginBottom: "10px",
          width: "90%",
          marginRight: "30%",
        }}>
        <div className="card" style={{ margin: "20px", marginLeft: "-50px" }}>
          <div className="topboders" style={{ height: "170px" }}></div>
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h4 className="card-title text-left text-capitalize">
                  {String(usersinfo.vehicle_info.type)}
                </h4>
              </div>
              <div>
                {!usersinfo.in_use ? (
                  <p className="card-title text-right">
                    <span style={{ color: "lightgreen" }}>●</span> Available
                  </p>
                ) : (
                  <p className="card-title text-right">
                    <span style={{ color: "#FF8C00" }}>●</span> Unavailable
                  </p>
                )}
              </div>
            </div>
            <p className="text-left">ID</p>
            <p className="card-text text-left">{usersinfo.id}</p>
            <hr />
            <div style={{ display: "flex", justifyContent: "start" }}>
              <div className="text-left" style={{ marginRight: "60px" }}>
                <div>
                  <p className="card-text">Color</p>
                </div>
                <div>
                  <p className="card-text text-capitalize">
                    {usersinfo.vehicle_info.color}
                  </p>
                </div>
              </div>

              <div className="text-left" style={{ marginLeft: "80px" }}>
                <div>
                  <p className="card-text text-left">Brand</p>
                </div>
                <div>
                  <p className="card-text">
                    {usersinfo.vehicle_info.purchase_information.manufacturer}
                  </p>
                </div>
              </div>
              <input type="hidden" value={"f"} />
            </div>
            <hr />
            <div style={{ display: "flex", justifyContent: "start" }}>
              <div className="text-left" style={{ marginRight: "60px" }}>
                <div>
                  <p className="card-text">Battery</p>
                </div>
                <div>
                  <p className="card-text">{usersinfo.battery}%</p>
                </div>
              </div>

              <div className="text-left" style={{ marginLeft: "66px" }}>
                <div>
                  <p className="card-text text-left">Purchase Date</p>
                </div>
                <div>
                  <p className="card-text">
                    {usersinfo.vehicle_info.purchase_information.purchase_date}
                  </p>
                </div>
              </div>
              <input type="hidden" value={"ff"} />
            </div>
            <hr />
            <div style={{ display: "flex", justifyContent: "start" }}>
              <div className="text-left" style={{ marginRight: "60px" }}>
                <div>
                  <p className="card-text">Serial #</p>
                </div>
                <div>
                  <p className="card-text">
                    {usersinfo.serial_number}
                  </p>
                </div>
              </div>

              <div className="text-left" style={{ marginLeft: "65px" }}>
                <div>
                  <p className="card-text text-left">Wear</p>
                </div>
                <div>
                  <p className="card-text text-capitalize">
                    {usersinfo.vehicle_info.wear}
                  </p>
                </div>
              </div>
              <input type="hidden" value={"f"} />
            </div>{" "}
            <hr />
            {!usersinfo.in_use ? (
              <Link
                onClick={startRide}
                to={`/ridedetail/${match.params.id}/false`}
                className="btn btn-danger"
                style={{
                  width: "100%",
                  backgroundColor: "#FF3565",
                  height: "calc(1.5em + 1.125rem + 2px)",
                  marginBottom: "5px",
                }}>
                Start ride
              </Link>
            ) : null}
            <Link
              to="/vehicles"
              className="btn btn-danger"
              style={{
                width: "80%",
                backgroundColor: "#FF3565",
                marginTop: "15px",
                marginRight: "100%",
                height: "calc(1.5em + 1.125rem + 2px)",
              }}
              onClick={deleteVehicle}>
              Remove vehicle
            </Link>
          </div>
        </div>

        <h3
          style={{
            marginBottom: "25px",
            marginTop: "10px",
            marginLeft: "-50px",
          }}>
          Location History
        </h3>
        {usersinfo.locationHistory.map((e) => {
          return (
            <div style={{ lineHeight: "1.5", marginLeft: "-50px" }}>
              <h4>Timestamp: {moment(e.ts).format("YYYY-MM-DD HH:mm:ss")}</h4>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="text-left">
                  <div>
                    <p className="card-text">Longitude</p>
                  </div>
                  <div>
                    <p className="card-text">{e.longitude}</p>
                  </div>
                </div>

                <div className="text-left">
                  <div>
                    <p className="card-text">Latitude</p>
                  </div>
                  <div>
                    <p className="card-text">{e.latitude}</p>
                  </div>
                </div>
                <input type="hidden" value={"f"} />
              </div>
              <hr />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Maps data from the Redux state management object for use on this page.
 *
 * @param  {object} state The Redux state object that contains persisted state data.
 * @returns {object} The mapped state data as an object that is passed into the page initialization function.
 */
const mapStateToProps = (state) => ({
  vehicles: state.data.vehicles,
  email: state.data.email,
  RideEndDetails: state.data.RideEndDetails,
  newVehicleID: state.data.newVehicleID,
});

export default connect(mapStateToProps, { removedVehicle, resetDash })(
  VehicleDetails
);
