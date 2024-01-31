import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Alert from 'react-bootstrap/Alert'
import { rideEndedDetails } from '../../../redux/actions'
/**
 * Initiation function for the RideDetails component.
 * This displays when a user starts a ride, and provides an "end ride" form
 * with validation.
 *
 * `match` is an object that includes the vehicle ID, 
 */
const RideDetails = ({ match, email, rideEndedDetails }) => {
    // Initialize the following state variables & defines the function to
    // mutate each one.
    const [longitude, setlongitude] = useState("")
    const [latitude, setlatitude] = useState("")
    const [battery, setbattery] = useState("")
    const [usersinfo, setusersinfo] = useState("")
    const [id, setid] = useState("")
    const [batteryValidate, setbatteryValidate] = useState("")
    const [latValidate, setlatValidate] = useState("")
    const [longValidate, setlongValidate] = useState("")
    const [bat, setbat] = useState(false)
    const [lat, setlat] = useState(false)
    const [long, setlong] = useState(false)
    const [req, setreq] = useState(false)

    /*
     * The UseEffect function is used when we want to gather the ride details
     * of a users ride.   
     */
    useEffect(() => {
        // provides time for start ride request to complete before requesting
        // active ride details.
        setTimeout(() => {
            try {
              /* http request that displays the currently selected ride's
               * details, using the vehicle id and the email that's saved in
               * session storage.
               * Later, this will call /api/rides/, but that entity doesn't
               * exist yet.
               */
              axios.get("/api/vehicles/" + match.params.id)
                   .then(function (response) {
                     // setting user response data inside userinfo state using
                     // the setstate method.
                     setusersinfo(response.data)
                     setid(response.data.id)
                    })
            } catch (e) {
              // Bug: Any exception thrown is effectively ignored.
              console.log('Exception caught and ignored. \n' +
                          'tag: 5d241ac7-cddf-434f-bbc5-34cdc67e6c6a\n' +
                          'error: {e}\n\n' +
                          'Message: {e.message}')
            }
        }, 1000)
        // the watcher on these dependencies trigger the component to update.
    }, [lat, long, bat, batteryValidate, longValidate, latValidate])


    /*
     * batteryNumber function will run to check user input
     *
     * @param {object} e is the argument of the event handler attached to the
     *                 onChange event of the battery input field.
     */
    const batteryNumber = (e) => {
      setbattery(e.target.value)
      // running check to see if value if accepted. e.target.value is the
      // value the text entered in the battery input.        
      if (isNaN(e.target.value) || e.target.value == "" || e.target.value > 100
          || e.target.value < 0 || e.target.value.includes(".")) {
          setbat(false)
        } else {
          setbat(true)
          setbatteryValidate(true)
        }
    }

    /*
     * Check user input for latitude.
     *
     * @param {object} e: argument of the event handler attached to the
     *                    onChange event of the latitude input field.
     *                    Only e.target.value (the latitude) is used here.
     */
    const latNumber = (e) => {
        setlatitude(e.target.value)
        // Check to see if value if accepted. e.target.value is the latitude.
        if (isNaN(e.target.value) || e.target.value == "" ||
            e.target.value > 90 || e.target.value < -90) {
          setlat(false)
        } else {
          setlat(true)
          setlatValidate(true)
        }
    }

    /*
     * Check user input for longitude.
     *
     * @param  {object} e is the argument of the event handler attached to the
     *                  onChange event of the longitude input field.
     *                  Only the longitude (e.target.value) is used.
     */
    const longNumber = (e) => {
      setlongitude(e.target.value)
      // running check to see if value if accepted. e.target.value is the
      // value the text entered in the longitude input.
      if (isNaN(e.target.value) || e.target.value == "" ||
          e.target.value > 180 || e.target.value < -180) {
        setlong(false)
      } else {
        setlong(true)
        setlongValidate(true)
      }
    }


    /*
     * This is click event handler that ends rides. It is triggered by the end
     * ride button.
     */
    const EndRide = () => {
      // running check to see if value if accepted.
      if (!long) {
        setlongValidate(false)
      }
      if (!lat) {
        setlatValidate(false)
      }

      if (!bat) {
        setbatteryValidate(false)
      }

      if (long && lat && bat) {
        try {
          /* Generate POST request to end the ride, passing user email,
           * vehicle id, longitude, latitude, and battery useStates.
           */
          setreq(true)
          axios.put(("/api/vehicles/" + id + "/checkin"), {
              longitude: longitude,
              latitude: latitude,
              battery: Number(battery)
          })
              .then(function (response) {
                // The response is sent to redux as a array and is provided
                // as a toast message if successful.
                  rideEndedDetails(response.data.messages)
                })
              .catch(function (error) {
                console.log('Exception caught and ignored while ending ' +
                            'a ride.\n' +
                            'tag: 4e77642f-a0ae-4c0e-b692-78f2b88d2417\n' +
                            'error: {error}\n\n' +
                            'Message: {error.message}')
              });
        } catch (e) {
          console.log('Exception caught and ignored while sending a ' +
                      '/rides/end POST request. \n' +
                      'tag: b11e32c7-2f54-406b-b00c-6aa817bd4319\n' +
                      'error: {e}\n\n' +
                      'Message: {e.message}')

        }
      }
    }


  /* If usersinfo (which has vehicle info) is not null, display the "end ride"
   * form.
   * Flashes alert for a newly started ride, if necessary.
   *
   * Note #1: the `usersinfo` object is actually the vehicle details object,
   * so after location_history has been created, it would be, e.g.:
   * {
   *   "id": "001d7e32-932c-4b2a-af01-8f31f7a56b09",
   *   "vehicle_type": "scooter",
   *   "battery": 48,
   *   "in_use": true,
   *   "locationHistory": [
   *     {
   *       "longitude": -74.2056,
   *       "latitude": 40.62091,
   *       "ts": "2021-02-01 23:42:04.845"
   *     },
   *     {
   *       "longitude": -74.2056,
   *       "latitude": 40.62091,
   *       "ts": "2020-04-29 19:04:13.000"
   *     }
   *   ]
   * }
   *
   * Note #2: that locationHistory array should be sorted by timestamp,
   * descending, so the first element is the most recent location.
   */
  return !usersinfo ? null : (
      <div>

          <h1 className="text-center" style={{ marginTop: "30px", fontWeight: "600" }}>
            Riding a {usersinfo.vehicle_type}
          </h1>


          <div className="container col-md-6" style={{ marginRight: "35.8%" }}>
              {/* if view isn't the string 'true', flash the "Ride Started" 
                * alert... I think this always displays?
                */}
              {match.params.view != "true" ? <Alert key={1} variant={'warning'}>
                  Ride started with vehicle {match.params.id}
              </Alert> : null}
              {/*
                * Display the vehicle ID in this element. Pretty
                * straightforward.
                */}
              <h5 style={{ fontWeight: "500", fontSize: "22px", color: 'black' }}>
                Vehicle ID: {usersinfo.id}
              </h5>

              <div style={{ display: 'flex', justifyContent: 'space-between', width: "75%" }}>
                  <div className="text-left">
                      <div>
                          <p className="card-text">Start Time</p>
                      </div>
                      <div>
                          <p className="card-text">{usersinfo.locationHistory[0].ts}</p>
                      </div>
                  </div>

                {/*
                  * Extracting longitude & latitude from the locationHistory
                  * array
                  */}
                  <div className="text-left">
                      <div>
                          <p className="card-text">Longitude</p>
                      </div>
                      <div>
                          <p className="card-text">{usersinfo.locationHistory[0].longitude}</p>
                      </div>
                  </div>

                  <div className="text-left">
                      <div>
                          <p className="card-text">Latitude</p>
                      </div>
                      <div>
                          <p className="card-text">{usersinfo.locationHistory[0].latitude}</p>
                      </div>
                  </div>

                {/*
                  * Extracting battery from the vehicle row (works the same for
                  * any version of MovR)
                  */}
                  <div className="text-left">
                      <div>
                          <p className="card-text">Battery</p>
                      </div>
                      <div>
                          <p className="card-text">{usersinfo.battery}%</p>
                      </div>
                  </div>
                  <input type="hidden" value={usersinfo.id} />
              </div>

              <div style={{ display: "flex", justifyContent: 'start', alignItems: "center", marginTop: "30px", marginBottom: "90px", lineHeight: "1.5" }}>
                  <div>
                      <form style={{ width: "600px", justifyContent: "stretch", border: "1px solid #E9E9E9", padding: "15px" }}>
                          <p>When you're finished riding, please input the following and end your ride:</p>
                          <div class="form-group">
                              <label for="exampleInputEmail1">Longitude</label>
                              <input style={{ height: "calc(1.5em + 1.125rem + 2px)" }} type="email" onChange={longNumber} class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
                              {longValidate === false ? <div><p>Longitude must be between -180 and 180.</p></div> : null}
                          </div>

                          <div class="form-group">
                              <label for="exampleInputEmail1">Latitude</label>
                              <input style={{ height: "calc(1.5em + 1.125rem + 2px)" }} type="text" onChange={latNumber} class="form-control" id="firstname" aria-describedby="password" />
                              {latValidate === false ? <div><p>Latitude must be between -90 and 90.</p></div> : null}
                          </div>

                          <div class="form-group">
                              <label for="exampleInputEmail1">Battery (percent)</label>
                              <input style={{ height: "calc(1.5em + 1.125rem + 2px)" }} type="text" required onChange={batteryNumber} class="form-control" id="lastname" aria-describedby="password" />
                              {batteryValidate === false ? <div><p>Not a valid integer value</p><p>Battery (percent) must be between 0 and 100</p></div> : null}
                          </div>

                          <Link to={req ? `/vehicledetail/${usersinfo.id}` : '#'} onMouseDown={EndRide} type="button" class="btn btn-danger form-control" style={{ height: "calc(1.5em + 1.125rem + 2px)", backgroundColor: '#FF3565' }}>End Ride</Link>
                      </form>
                  </div>
              </div>
          </div>
      </div>
  )
}



/*
 * Maps data from the Redux state management object for use on this page.
 *
 * @param  {object} state The Redux state object that contains persisted state
 *                  data. 
 * @returns {object} The mapped state data as an object that is passed into the
 *                   page initialization function.
 */
const mapStateToProps = (state) => ({
    vehicles: state.data.vehicles,
    email: state.data.email
})

export default connect(mapStateToProps, { rideEndedDetails })(RideDetails)
