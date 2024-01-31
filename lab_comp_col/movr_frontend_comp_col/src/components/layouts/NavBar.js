import React, { useEffect } from "react";
import { Link, useHistory, withRouter, NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { logout } from "../../redux/actions";
import Movr from "../images/horizontal-logo.png";
import User from "../images/user.svg";
import pin from "../images/chevron-down.svg";
import "./index.css";
import { Nav } from "react-bootstrap";

/**
 *Initiation function for the NavBar component
 */
function NavBar({ email, logout }) {
  // useHistory a react hook that is being used to push a new component on top of the current component.
  const history = useHistory();

  /**
   *This function clears the sessionStorage and removes the users localdata as well as log them out.
   */
  const Loggedout = () => {
    // calling logout from redux to complete the logout process
    logout();
    // sessionStorages allow for storing data locally. Currently clearing the stored user data if there was any error
    sessionStorage.clear();
    history.push("/");
  };

  return (
    <div style={{ width: "75%", margin: "0 auto" }}>
      <nav
        className="navbar navbar-expand-sm navbar-light"
        style={{ paddingTop: "20px" }}>
        <img
          style={{ marginLeft: "30px", marginRight: "25px" }}
          src={Movr}
          height={25}
          width={130}
        />
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          data-toggle="collapse"
          data-target="#collapsibleNavId"
          aria-controls="collapsibleNavId"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="collapsibleNavId">
          <ul className="navbar-nav mr-auto mt-2 mt-lg-0" id="myDIV">
            <li className="nav-item btn">
              <NavLink
                activeStyle={{ borderBottom: "2px solid black" }}
                className="nav-link text-dark"
                to="/vehicles">
                Vehicles
              </NavLink>
            </li>
            <li className="nav-item btn">
              <NavLink
                activeStyle={{ borderBottom: "2px solid black" }}
                className="nav-link text-dark"
                to="/rides">
                My Rides
              </NavLink>
            </li>
          </ul>
          <form
            className="form-inline my-2 my-lg-0"
            style={{ marginRight: "70px" }}>
            <Link
              className="btn btn-outline-danger my-2 my-sm-0 buttoncolor"
              style={{
                textAlign: "center",
                fontWeight: "500",
                lineHeight: "1.5",
                borderRadius: "6px",
              }}
              to="/addvehicles">
              + New Vehicle
            </Link>{" "}
            <span
              style={{
                color: "grey",
                paddingLeft: "10px",
                paddingRight: "5px",
                fontSize: "25px",
              }}>
              {" "}
              |{" "}
            </span>
            <a
              className="nav-item dropdown nav-link"
              href="/"
              id="navbarDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false">
              <img src={User} />
              <img src={pin} />
            </a>
            <div
              className="dropdown-menu dropdown-menu-sm-right"
              aria-labelledby="navbarDropdown">
              <Link to="/profile" className="dropdown-item">
                Your Profile
              </Link>
              <a className="dropdown-item" onMouseDown={Loggedout}>
                Logout
              </a>
            </div>
          </form>
        </div>
      </nav>
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
});

export default connect(mapStateToProps, { logout })(NavBar);
