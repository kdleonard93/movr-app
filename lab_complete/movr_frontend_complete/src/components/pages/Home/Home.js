import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { connect } from "react-redux";
import { logins, reset } from "../../../redux/actions";
import Movr from "../../images/horizontal-logo.png";
import { Link, useHistory } from "react-router-dom";
import "./index.css";
import { Alert } from "reactstrap";

/**
 * Initiation function for the Home component
 */
const Home = ({ logins, login, logout, newemail, deletedUser, vehicleID }) => {
  // emails is a string variable that contains the value of the email input from the user
  const [emails, setemails] = useState("");
  // validEmail is a boolean variable that returns whether the inputted email is valid or not
  const [validEmail, setvalidEmail] = useState(true);
  // newEmail is a boolean variable that returns whether the inputted email is a new email or not
  const [newEmail, setnewEmail] = useState("");
  // loggedout is a boolean variable that returns whether the user is logged out or not
  const [loggedout, setloggedout] = useState(false);
  // deleted is a boolean variable that returns whether a email is deleted or not
  const [deleted, setdeleted] = useState("");
  const history = useHistory();

  /**
   * The loginEmail function is used to determine which toast messages will display
   */
  const loginEmail = (e) => {
    e.preventDefault();
    if (emails == "") {
      setvalidEmail(false);
      setloggedout(false);
      setnewEmail(false);
      setdeleted(false);
    } else {
      try {
        // axios is a http library used to retrieve data from APIS. Currently using to check login with the users email
        axios
          .post("/api/login", {
            email: emails,
          })
          .then(function (response) {
            // calling a redux logins function to log user in
            logins(emails);
            history.push("/vehicles");
          })
          .catch(function (error) {
            // checking to make sure popups are closed
            setvalidEmail(false);
            setloggedout(false);
            setnewEmail(false);
            setdeleted(false);
          });
      } catch (err) {
        // checking to make sure popups are closed
        setvalidEmail(false);
        setloggedout(false);
        setnewEmail(false);
        setdeleted(false);
      }
    }
  };

  /**
   * In this useEffect, we are checking the conditional on startup to make determine which toast to display at that time.
   */
  useEffect(() => {
    // checking to make sure the user deleted toast message is open
    if (deletedUser != "") {
      setdeleted(true);
      setloggedout(false);
      setnewEmail(false);
    }
    // checking to make sure the user logged out toast message is open
    if (login === false && logout === false) {
      setloggedout(true);
      setnewEmail(false);
      setdeleted(false);
    }
    // checking to make sure the user new email toast message is open
    if (newemail != "") {
      setnewEmail(true);
      setloggedout(false);
      setdeleted(false);
    }
  }, []);

  /**
   * This is the same login function but used for the ENTER press on keyboard
   *
   * @param  {object} e is the argument of the event handler attached to the onChange event of the email input field.
   */
  const go = (e) => {
    if (e.keyCode == 13) {
      try {
        axios
          .post("/api/login", {
            email: emails,
          })
          .then(function (response) {
            // calling a redux logins function to log user in
            logins(emails);
            history.push("/vehicles");
          })
          .catch(function (error) {
            // checking to make sure popups are closed
            setvalidEmail(false);
            setloggedout(false);
            setnewEmail(false);
            setdeleted(false);
          });
      } catch (err) {
        // checking to make sure popups are closed
        setvalidEmail(false);
        setloggedout(false);
        setnewEmail(false);
        setdeleted(false);
      }
    }
  };

  return (
    <div className="App">
      <div
        className="container"
        style={{ marginLeft: "270px", height: "100vh" }}>
        <div>
          <div style={{ lineHeight: "1.2", paddingTop: "100px" }}>
            <img src={Movr} style={{ marginBottom: "50px" }} />
            <div style={{ marginTop: "130px", lineHeight: "2" }}>
              <h1 style={{ fontWeight: "600", fontSize: "40px" }}>Log In</h1>

              <div className="col-6-lg" style={{ width: "600px" }}>
                <Alert
                  color="warning"
                  style={{ padding: "20px" }}
                  isOpen={loggedout}>
                  You have successfully logged out
                </Alert>

                <Alert
                  color="warning"
                  style={{ padding: "20px" }}
                  isOpen={deleted}>
                  {deletedUser}
                </Alert>

                <Alert
                  color="warning"
                  style={{ padding: "20px" }}
                  isOpen={newEmail}>
                  Registration successful! You can now log in as `{newemail}`.
                </Alert>

                {!validEmail ? (
                  <Alert color="warning" style={{ padding: "20px" }}>
                    Invalid user credentials.
                    <br /> If you aren't registered with MovR, go{" "}
                    <Link
                      to="/register"
                      type="button"
                      class=""
                      style={{ color: "#FF3565" }}>
                      Sign Up
                    </Link>
                    !
                  </Alert>
                ) : null}
                <p style={{ color: "#B2B3C2" }}>
                  Sign in to your account using email you provided during
                  registration
                </p>

                <div className="form-group">
                  <label htmlFor="exampleInputEmail1">Email:</label>
                  <input
                    onKeyDown={go}
                    required
                    onChange={(e) => setemails(e.target.value)}
                    style={{ height: "calc(1.5em + 1.125rem + 2px)" }}
                    type="email"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                  />
                </div>

                <Link
                  onClick={loginEmail}
                  to="/vehicles"
                  type="button"
                  className="btn btn-danger form-control"
                  style={{
                    width: "100%",
                    backgroundColor: "#FF3565",
                    height: "calc(1.5em + 1.125rem + 2px)",
                  }}>
                  Sign In
                </Link>

                <p
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    color: "#B2B3C2",
                  }}>
                  Don't have account?{" "}
                  <Link to="/register" class="" style={{ color: "#FF3565" }}>
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <p
            style={{
              position: "absolute",
              bottom: "0",
              marginLeft: "10px",
              fontSize: "14px",
              marginBottom: "40px",
              color: "#B2B3C2",
            }}>
            &copy; CockroachLabs
          </p>
        </div>
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
  vehicleID: state.data.vehicleID,
  login: state.data.login,
  logout: state.data.logout,
  email: state.data.email,
  registeredUser: state.data.registeredUser,
  deletedUser: state.data.deletedUser,
  newemail: state.data.newemail,
});

export default connect(mapStateToProps, { logins, reset })(Home);
