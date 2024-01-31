import React, { useState, useEffect } from 'react'
import './index.css'
import { Alert } from 'reactstrap';
import axios from 'axios';
import Movr from '../../images/horizontal-logo.png'
import { Link, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { newRegistration } from '../../../redux/actions'

/**
 *Initiation function for the Registration component
 */
const Registration = ({ newRegistration }) => {

  // last_name is a string variable that contains the value of the last name that the user inputs
  const [last_name, setlast_name] = useState("")
  // first_name is a string variable that contains the value of the first name that the user inputs
  const [first_name, setfirst_name] = useState("")
  // phone_numbers is a string variable that contains the value of the phone number that the user inputs
  const [phone_numbers, setphone_numbers] = useState([])
  // regValidEmail is a boolean variable that contains a true or false if the user is registered
  const [regValidEmail, setregValidEmail] = useState("")
  // nullEmail is a boolean variable that contains the value of true or false is the user email is null
  const [nullEmail, setnullEmail] = useState("")
  // emails is a string variable that contains the value of the email that the user inputs
  const [emails, setemails] = useState("")
  // loggedout is a boolean variable that contains the value of true or false is a user is logged out
  const [loggedout, setloggedout] = useState(false)
  // fn is a boolean variable that verifies data in a the first name input
  const [fn, setfn] = useState(false)
  // ln is a boolean variable that verifies data in a the last name input
  const [ln, setln] = useState(false)
  // em is a boolean variable that verifies data in a the email input
  const [em, setem] = useState(false)
  const [fnValidate, setfnValidate] = useState("")
  const [lnValidate, setlnValidate] = useState("")
  const [emValidate, setemValidate] = useState("")
  const history = useHistory()

  /**
 * emailcheck function will run to check user input
 *
 * @param  {object} e is the argument of the event handler attached to the onChange event of the email input field.
 */
  const emailcheck = (e) => {
    setemails(e.target.value)
    if (e.target.value == "") {
      setem(false)
    } else {
      setem(true)
      setemValidate(true)
    }
  }

  /**
 * firstnamecheck function will run to check user input
 *
 * @param  {object} e is the argument of the event handler attached to the onChange event of the first name input field.
 */
  const firstnamecheck = (e) => {
    setfirst_name(e.target.value)
    if (e.target.value == "") {
      setfn(false)
    } else {
      setfn(true)
      setfnValidate(true)
    }
  }

  /**
  * lastnamecheck function will run to check user input
  *
  * @param  {object} e is the argument of the event handler attached to the onChange event of the last name input field.
  */
  const lastnamecheck = (e) => {
    setlast_name(e.target.value)
    if (e.target.value == "") {
      setln(false)
    } else {
      setln(true)
      setlnValidate(true)
    }
  }

  /**
  * This is click event handler that register new users. It is triggered by the register button.
 */
  const Register = () => {
    if (!em) {
      setemValidate(false)
    }

    if (!fn) {
      setfnValidate(false)
    }
    if (!ln) {
      setlnValidate(false)
    }


    // if (emails == "" || first_name == "" || last_name == "") {
    //   setnullEmail(false)
    //   setregValidEmail("")
    //   return false;
    // }
    // new user email is passed through redux and the new user is displayed
    if (em && fn && ln) {
      newRegistration(String(emails))
      try {
        // making http request to register a new user
        axios.post('/api/register', {
          email: String(emails),
          last_name: String(last_name),
          first_name: String(first_name),
          phone_numbers: phone_numbers.length != 0 ? phone_numbers.split(",") : []
        })
          .then(function () {
            // opening up successful registration toast message
            setregValidEmail(true)
            setloggedout(false)
            setnullEmail(true)
            history.push('/')
          })
          .catch(function (error) {
            // opening up unsuccessful registration toast message
            setnullEmail(true)
            setregValidEmail(false)
            setloggedout(false)
          })
      } catch (err) {
        // opening up unsuccessful registration toast message
        setnullEmail(true)
        setregValidEmail(false)
        setloggedout(false)
      }
    }
  }

  return (
    <div className="App">
      <div className="container" style={{ marginLeft: "270px", height: '100vh' }}>
        <div>



          <div style={{ lineHeight: '1.2', paddingTop: "100px" }}>
            <img src={Movr} style={{ marginBottom: "50px" }} />
            <div style={{ marginTop: "20px", lineHeight: "2" }}>
              <h1 style={{ fontWeight: '600', fontSize: '40px' }}>Sign Up</h1>
              <div className="col-6-lg" style={{ width: '600px' }}>
                <form>
                  {regValidEmail ? <Alert color="warning" style={{ padding: "20px" }}>
                    Registration successful! You can now log in as {emails}
                  </Alert> : null}
                  {regValidEmail === false ? <Alert color="warning" style={{ padding: "20px" }}>
                    Registration failed. Make sure that you choose a unique email!
  </Alert> : null}
                  {nullEmail === false ? <Alert color="warning" style={{ padding: "20px" }}>
                    Registration failed. Please fill out required fields!
  </Alert> : null}
                  <div class="form-group">
                    <label for="exampleInputEmail1">Email</label>
                    <input type="email" onChange={emailcheck} class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
                    {emValidate === false ? <div><p>Please enter an email address.</p></div> : null}
                  </div>

                  <div class="form-group">
                    <label for="exampleInputEmail1">First name:</label>
                    <input type="text" onChange={firstnamecheck} class="form-control" id="firstname" aria-describedby="password" />
                    {fnValidate === false ? <div><p>Please enter your first name.</p></div> : null}
                  </div>

                  <div class="form-group">
                    <label for="exampleInputEmail1">Last name:</label>
                    <input type="text" onChange={lastnamecheck} class="form-control" id="lastname" aria-describedby="password" />
                    {lnValidate === false ? <div><p>Please enter your last name.</p></div> : null}
                  </div>

                  <div class="form-group">
                    <label for="exampleInputEmail1">Phone number</label>
                    <input type="text" onChange={(e) => setphone_numbers(e.target.value)} class="form-control" id="password" aria-describedby="password" />
                  </div>
                  <button onClick={Register} type="button" class="btn btn-danger form-control" style={{ backgroundColor: '#FF3565' }}>Register</button>
                  <p className="text-center" style={{ marginTop: '5px' }}>Already have an account? <a href="/" data-dismiss="modal" style={{ color: "#FF3565" }}>Log in</a></p>
                  <p style={{ color: "#737491" }}>* For multiple numbers, please separate with a comma.</p>
                </form>
              </div>
            </div>
          </div>


          <p style={{ position: 'absolute', bottom: '0', marginLeft: '10px', fontSize: '14px', marginBottom: "40px", color: "#737491" }}>© CockroachLabs</p></div>
      </div></div>
  )
}

/**
 * Maps data from the Redux state management object for use on this page.
 *
 * @param  {object} state The Redux state object that contains persisted state data. 
 * @returns {object} The mapped state data as an object that is passed into the page initialization function.
 */
const mapStateToProps = (state) => ({
  email: state.data.email,
  registeredUser: state.data.registeredUser,
})

export default connect(mapStateToProps, { newRegistration })(Registration)
