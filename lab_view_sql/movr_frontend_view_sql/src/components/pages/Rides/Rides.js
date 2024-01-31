import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import { endRides } from "../../../redux/actions";
import { connect } from "react-redux";
import "./index.css";

/**
 * Initiation function for the Registration component
 */
function Rides({ rides, endRides, email }) {
  // Rides is a array variable that contains the user ride data from the API
  const [Rides, setRides] = useState([]);

  /**
   * This UseEffect function is used when we want to return all the users current rides on startup.
   */
  useEffect(() => {
    // retrieving the current users rides using http request and session storage
    Axios.get("/api/rides?email=" + sessionStorage.getItem("user")).then(
      function (response) {
        // populating the Rides state with user ride data
        setRides(response.data);
      }
    );
  }, []);

  // If Rides isn't empty, display a table of the rides.
  // Else, nada.
  return Rides ? (
    <div
      className="container"
      style={{ paddingLeft: "0px", paddingRight: "0px", minWidth: "1250px" }}>
      <h1 style={{ margin: "20px", textAlign: "center", fontSize: "42px" }}>
        Rides
      </h1>
      <p className="text-center">
        You are logged in as {email}. Go to the{" "}
        <Link className="text-danger" to="/vehicles">
          Vehicles
        </Link>{" "}
        page to start a ride.
      </p>
      <br />
      {Rides.map((e) => {
        return (
          <div
            key={e.id}
            style={{ width: "100%", lineHeight: "2", fontSize: "15px" }}>
            <div className="text">
              <div className="text-left" style={{ marginRight: "20px" }}>
                <h5>Vehicle ID: {e.id}</h5>
              </div>
              <div>
                {/*If there IS an end time, display a green dot and "Inactive."*/}
                {/*If there is NOT an end time, display an orange dot and "Active."*/}
                {/*Note: There's also a "View ride" button but the logic for that is below.*/}
                {!e.end_time ? (
                  <p className="card-title text-right">
                    <span style={{ color: "lightgreen" }}>●</span> Active
                  </p>
                ) : (
                  <p className="card-title text-right">
                    <span style={{ color: "#FF8C00" }}>●</span> Inactive
                  </p>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
                alignSelf: "center",
              }}>
              <div className="text-left" style={{ marginRight: "30px" }}>
                <div>
                  <p className="card-text">Start time</p>
                </div>
                <div>
                  <p className="card-text">{e.start_time}</p>
                </div>
              </div>
              <div style={{ marginLeft: "80px" }}>
                <div>
                  <p className="card-text">End time</p>
                </div>
                <div>
                  <p className="card-text">{e.end_time ? e.end_time : "None"}</p>
                </div>
              </div>
              {/*If there NOT an end time, then give them a "View ride" button to resume that ride.*/}
              {e.end_time ? null : (
                <Link
                  to={`/ridedetail/${e.id}/true`}
                  className="btn btn-danger"
                  style={{
                    marginLeft: "80px",
                    backgroundColor: "#FF3565",
                    width: "10%",
                    height: "calc(1.5em + 1.125rem + 2px)",
                  }}>
                  View ride
                </Link>
              )}
            </div>
            <hr />
          </div>
        );
      })}
    </div>
  ) : null;
}

/**
 * Maps data from the Redux state management object for use on this page.
 *
 * @param  {object} state The Redux state object that contains persisted state data.
 * @returns {object} The mapped state data as an object that is passed into the page initialization function.
 */
const mapStateToProps = (state) => ({
  email: state.data.email,
});

export default connect(mapStateToProps, { endRides })(Rides);
