import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { deleteUserConfirm, logout } from "../../../redux/actions";

/**
 * Initiation function for the Profile component
 */
function Profile({ email, deleteUserConfirm, logout }) {
  // userinfo is a array variable that contains the user data from the API call
  const [usersinfo, setusersinfo] = useState("");
  // history is a react hook that allows you to push to another page through hooks.
  const history = useHistory();

  /**
   * This current UseEffect function is used when we want to retrieve the current users profile to be displayed.
   */
  useEffect(() => {
    // axios is a http library used to retrieve data from APIS. Currently grabbing user data from API.
    axios
      .get("/api/users?email=" + email)
      .then(function (response) {
        // Set timeout used to allow time for backend request processing
        setTimeout(() => {
          // setting user data inside userinfo state using the setstate method.
          setusersinfo(response.data);
        }, 1000);
      })
      .catch(function (error) {});
  }, []);

  /**
   * This is click event handler that deletes the current user.  It is triggered by delete my account button.
   */
  const DeleteUser = () => {
    // making http request to delete the current user, by passing current user email as a parameter
    axios
      .delete("/api/users/delete?email=" + email)
      .then(function (response) {
        deleteUserConfirm(response.data);
        // set timeout add to allow user deletion to complete
        setTimeout(() => {
          sessionStorage.clear();
          deleteUserConfirm(response.data);
        }, 1500);
      })
      .catch(function (error) {
        // sessionStorages allow for storing data locally. Currently clearing the stored user data if there was any error
        sessionStorage.clear();
        history.push("/");
      })
      .then(function () {
        // sessionStorages allow for storing data locally. Currently clearing the stored user data after user is deleted
        sessionStorage.clear();
        history.push("/");
      });
  };

  return !usersinfo ? null : (
    <div
      className="container"
      style={{ paddingLeft: "0px", paddingRight: "0px" }}>
      <h1 style={{ margin: "20px", fontWeight: "bold", textAlign: "center" }}>
        {usersinfo.user.first_name} {usersinfo.user.last_name}
      </h1>
      <p style={{ marginLeft: "40px" }}>
        You are logged in as {usersinfo.user.email}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "start",
          flexDirection: "column",
          textAlign: "left",
          border: "1px solid",
          borderColor: "#E9E9E9",
        }}>
        <table
          className="table text-left"
          style={{
            border: "1px solid black",
            marginLeft: "50px",
            marginTop: "15px",
            width: "400px",
          }}>
          <tr>
            <td
              style={{
                textAlign: "center",
                height: "60px",
                padding: "30px",
                borderTopColor: "black",
                fontWeight: "700",
                color: "#737491",
              }}>
              Phone Number(s)
            </td>
          </tr>
          {usersinfo.user.phone_numbers.length != 0
            ? usersinfo.user.phone_numbers.map((e) => {
                return (
                  <tr>
                    <td
                      style={{
                        textAlign: "center",
                        paddingTop: "0px",
                        paddingBottom: "0px",
                        borderTopColor: "black",
                        color: "#737491",
                      }}>
                      {e}
                    </td>
                  </tr>
                );
              })
            : null}
        </table>
      </div>
      <div
        style={{
          padding: "20px",
          backgroundColor: "#FFF9F2",
          width: "18rem",
          marginTop: "30px",
        }}>
        <Link
          to="/"
          className="btn btn-danger"
          style={{
            backgroundColor: "#FF3565",
            width: "100%",
            height: "calc(1.5em + 1.125rem + 2px)",
          }}
          onClick={DeleteUser}>
          Delete my account
        </Link>
      </div>
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

export default connect(mapStateToProps, { deleteUserConfirm, logout })(Profile);
