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
  // Skip this entirely & just load the vehicles dashboard.
  window.location.replace("/#/vehicles");
  // state objects
  const [emails, setemails] = useState("");
  const [validEmail, setvalidEmail] = useState(true);
  const [newEmail, setnewEmail] = useState("");
  const [loggedout, setloggedout] = useState(false);
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

  // This is where the login page will go later, but for now it's just `null`.
  return null; 
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
