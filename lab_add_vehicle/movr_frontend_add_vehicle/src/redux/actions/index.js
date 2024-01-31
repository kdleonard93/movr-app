import axios from "axios"

/** Defines all of the different actions called as functions throughout the
 * react app.
 * Also used as a central store area where you can save all of your components'
 * data/states.
*/

export const logins =(email)=>{
  if(sessionStorage.getItem("user")){
    return({
      type: "LOGIN",
      payload: sessionStorage.getItem("user")
    })
  } else {
    sessionStorage.setItem('user', email)
  return({
      type: "LOGIN",
      payload: email
    })
  }
}

export const navbar=(loc)=>{
  return({
    type: "LOCATION",
    payload: loc
  })
}

export const AddNewVehicleID=(id)=>{
  return({
    type: "NEWVEH",
    payload: id
  })
}

export const deleteUserConfirm =(mes)=>{
  return({
    type: "DELETEDUSER",
    payload: mes
  })
}

export const rideEndedDetails =(res)=>{
    return({
        type: "RIDEENDED",
        payload: res
    })
}

export const newRegistration =(res)=>{
    return({
        type: "NEWEMAIL",
        payload: res
    })
}

export const logout = () => {
  return({
      type: "LOGOUT"
    })
}

export const removedVehicle = (veh) => {
    return({
        type: "REMOVEDVEHICLE",
        payload: veh
    })
}

export const resetDash = () => {
    return({
        type: "RESETDASH",
        payload: null
    })
}  

export const reset = () => {
    return({
        type: "RESET"
    })
}

export const startRides = (email,id) => dispatch => {
    try {
      axios.put('api/vehicles/' + id + '/checkout', {
        email: email,
        vechicle_id: id
      })
      .then(function (response) {
        alert("AS")
        console.log("Ride with vehicle '" + id + "' started correctly.")

        dispatch({
            type: 'STARTRIDE',
            payload: response
        })
      })
      .catch(function (error) {
        console.log("Caught error:");
        console.log(error);
      })
    } catch(err) {
      // error is being thrown away.
      console.log("try/catch error caught.");
      console.log(err);
    }
}

export const endRides = (dec) => dispatch => {
    dispatch({
      type: "ENDRIDE",
    })
}
