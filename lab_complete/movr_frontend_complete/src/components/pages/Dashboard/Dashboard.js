import React, { useEffect, useState } from "react";
import "./index.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { startRides, resetDash } from "../../../redux/actions";
import { connect } from "react-redux";
import { Alert } from "reactstrap";


/**
  * Dashboard is actually the place where the /vehicles/ page is rendered.
  * Also flashes the ephemeral messages shown (deleted vehicle, started/ended
  * ride, etc.) based on HTTP responses from redux/actions/index.js. Not sure
  * this is the best way to do things, but I can't justify the time needed to
  * rebuild it yet. -Will
*/

function Dashboard({ email, vehicleID, resetDash }) {
  // These useState() calls assign and initialize state variables. Later, the
  // user data from the API call will be set by setStateVar()
  const [vehicleList, setvehicleList] = useState([]);
  const [id, setid] = useState("");
  const [deletedVehicle, setdeletedVehicle] = useState("");
  // Define the alert message used when a vehicle is deleted.
  var vehicleDeletedAlert;
  if (vehicleID != null) {
    /** Potential bug: Currently assumes that any error in deletion is due to
      * vehicle being in use. This is a false assumption. See the deleteVehicle
      * function's axios.delete().then().then().catch() function in
      * VehicleDetails.js for more details.
    */
    if (vehicleID.slice(0, 13) === "NOT DELETED: ") {
      vehicleDeletedAlert = ("DID NOT DELETE VEHICLE \"" + 
                             vehicleID.slice(13) +  // actual UUID string.
                             "\" BECAUSE IT IS CURRENTLY IN USE.");
    } else {
      vehicleDeletedAlert = "Deleted vehicle '" + vehicleID + "'.";
    };
  };

  /**
    * This useEffect acts as a watcher that checks for component
    * updates/mounts/unmounts
    * See above -- this probably isn't the best way to perform alerts, but it
    * works OK for now.
  */
  useEffect(() => {
    /** axios is an http library used to retrieve data from APIs. Currently
      * getting and populating the vehicle list.
      * I think it's polling the entire vehicles list in order to 
      * flash a single message.
    */
    axios
      .get("/api/vehicles?max_vehicles=20")
      .then(function (response) {
        // populating vehicleList state with data
        setvehicleList(response.data);
        // It is checking vehicleID for null (!) to determine if we should
        // display a "Vehicle deleted" message.
        if (vehicleID != null) {
          // removing toast message display about vehicle being deleted
          // Either this is wrong, or the next one is. Not sure which. :\
          setdeletedVehicle(true);
        } else {
          // removing toast message about vehicle being deleted
          // Either this is wrong, or the next one is. Not sure which. :\
          setdeletedVehicle(false);
        }
      })
      .catch(function (error) {});
    // watching for any changes in vehicleID
  }, [vehicleID]);

  // Click event handler that starts a new ride for the current user.
  const startRide = () => {
    // REST request to start ride
    axios
      .post("/api/rides/start", {
        email: email,
        vehicle_id: id,
      })
      .then(function (response) {
        console.log("Email : " + email);
      })
      .catch(function (error) {});
  };

  // Bug: nothing gets displayed if you delete your last vehicle.
  return (
    <div
      className="container"
      style={{ paddingLeft: "0px", paddingRight: "0px" }}>
      <h1 style={{ margin: "20px", textAlign: "center" }}>Vehicles</h1>
      {/* <Alert> displays vehicleDeletedAlert if you deleted a vehicle.*/}
      <Alert
        color="warning"
        style={{ padding: "20px" }}
        isOpen={deletedVehicle}>
        '{vehicleDeletedAlert}'
      </Alert>
      {/* The actual page of /vehicles is below.*/}
      <p className="text-left">
        Below is a list of all* vehicles, their location, and their status.
      </p>
      <div className="row">
        {vehicleList.map((e) => {
          return (
            <div
              key={e.id}
              className="col-lg-4 col-md-6"
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "25px",
              }}>
              <div className="card" style={{ width: "100%" }}>
                <div className="topboders" style={{ height: "170px" }}></div>
                <div className="card-body">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "40px",
                    }}>
                    <div>
                      <h4 className="card-title text-left text-capitalize">
                        {e.vehicle_info.type}
                      </h4>
                    </div>
                    <div>
                      {!e.in_use ? (
                        <p className="card-title text-right">
                          <span style={{ color: "lightgreen" }}>●</span>{" "}
                          Available
                        </p>
                      ) : (
                        <p className="card-title text-right">
                          <span style={{ color: "#FF8C00" }}>●</span>{" "}
                          Unavailable
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/vehicledetail/${e.id}`}
                    className="btn btn-danger"
                    style={{
                      width: "80%",
                      backgroundColor: "#FF3565",
                      height: "calc(1.5em + 1.125rem + 2px)",
                    }}>
                    See Vehicle
                  </Link>
                  <hr />
                  <p className="text-left">ID</p>
                  <p className="card-text text-left">{e.id}</p>
                  <hr />
                  <div style={{ display: "flex", justifyContent: "start" }}>
                    <div className="text-left">
                      <div>
                        <p className="card-text">Longitude</p>
                      </div>
                      <div>
                        <p className="card-text">
                          {Number.isInteger(e.last_longitude)
                            ? e.last_longitude + ".0"
                            : e.last_longitude}
                        </p>
                      </div>
                    </div>

                    <div className="text-left" style={{ marginLeft: "70px" }}>
                      <div>
                        <p className="card-text">Latitude</p>
                      </div>
                      <div>
                        <p className="card-text text-left">
                          {Number.isInteger(e.last_latitude)
                            ? e.last_latitude + ".0"
                            : e.last_latitude}
                        </p>
                      </div>
                    </div>
                    <input type="hidden" value={e.vehicle_id} />
                  </div>
                  <hr />
                  <div style={{ display: "flex", justifyContent: "start" }}>
                    <div className="text-left">
                      <div>
                        <p className="card-text">Color</p>
                      </div>
                      <div>
                        <p className="card-text text-capitalize">
                          {e.vehicle_info.color}
                        </p>
                      </div>
                    </div>

                    <div className="text-left" style={{ marginLeft: "100px" }}>
                      <div>
                        <p className="card-text text-left">Brand</p>
                      </div>
                      <div>
                        <p className="card-text">
                          {e.vehicle_info.purchase_information.manufacturer}
                        </p>
                      </div>
                    </div>
                    <input type="hidden" value={e.vehicle_id} />
                  </div>
                  <hr />
                  <div style={{ display: "flex", justifyContent: "start" }}>
                    <div className="text-left">
                      <div>
                        <p className="card-text">Battery</p>
                      </div>
                      <div>
                        <p className="card-text">{e.battery}%</p>
                      </div>
                    </div>
                  </div>{" "}
                  <hr />
                  {!e.in_use ? (
                    <Link
                      onClick={startRide}
                      onFocus={() => setid(e.id)}
                      to={`/ridedetail/${e.id}/false`}
                      className="btn btn-danger"
                      style={{
                        width: "100%",
                        backgroundColor: "#FF3565",
                        height: "calc(1.5em + 1.125rem + 2px)",
                      }}>
                      Start ride
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p>
        * The query is limited to the first 20 vehicles in the table to ensure
        quick rendering, but there may be many more rows in the table.
      </p>
    </div>
  );
}

/**
 * Maps data from the Redux state management object for use on this page.
 *
 * @param  {object} state The Redux state object that contains persisted state data.
 * @returns {object} The mapped state data as an object that is passed into the page initialization function.
 */
const mapStateToProps = (state) => ({
  email: state.data.email,
  vehicleID: state.data.vehicleID,
});

export default connect(mapStateToProps, { startRides, resetDash })(Dashboard);
