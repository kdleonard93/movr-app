import React, { useState } from "react";
import "./index.css";
import { Link, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { AddNewVehicleID } from "../../../redux/actions";
import axios from "axios";

/**
 * Initiation function for the AddVehicles component
 */
function AddVehicles({ AddVehicle, newVehicleID, AddNewVehicleID }) {
  // type is a string variable that contains the value of the type input from the user
  const [Type, setType] = useState("Bike");
  // longitude is a number variable that contains the value of the longitude input from the user
  const [longitude, setlongitude] = useState("");
  // latitude is a number variable that contains the value of the latitude input from the user
  const [latitude, setlatitude] = useState("");
  // battery is a number variable that contains the value of the battery input from the user
  const [battery, setbattery] = useState("");
  // color is a string variable that contains the value of the color input from the user
  const [color, setcolor] = useState("");
  // manufacturer is a string variable that contains the value of the manufacturer input from the user
  const [manufacturer, setmanufacturer] = useState("");
  // SerialNumber is a string variable that contains the value of the SerialNumber input from the user
  const [SerialNumber, setSerialNumber] = useState("");
  // VehicleWear is a string variable that contains the value of the VehicleWear input from the user
  const [VehicleWear, setVehicleWear] = useState("");
  // PurchaseDate is a string variable that contains the value of the PurchaseDate input from the user
  const [PurchaseDate, setPurchaseDate] = useState("");
  // useHistory a react hook that is being used to push a new component on top of the current component.
  const history = useHistory();
  // batteryValidate is a boolean variable that contains the battery value check
  const [batteryValidate, setbatteryValidate] = useState("");
  // latValidate is a boolean variable that contains the latitude value check
  const [latValidate, setlatValidate] = useState("");
  // longValidate is a boolean variable that contains the longitude value check
  const [longValidate, setlongValidate] = useState("");
  // serialNumberValidate is a boolean variable that contains the serial number value check
  const [serialNumberValidate, setserialNumberValidate] = useState("");
  // purchaseDateValidate is a boolean variable that contains the purchase value check
  const [purchaseDateValidate, setpurchaseDateValidate] = useState("")
  // bat is a boolean variable that verifies data in a the battery input
  const [bat, setbat] = useState(false);
  // lat is a boolean variable that verifies data in a the latitude input
  const [lat, setlat] = useState(false);
  // long is a boolean variable that verifies data in a the longitude input
  const [long, setlong] = useState(false);
  // color is a boolean variable that verifies data in a the color input
  const [col, setcol] = useState(false);
  // serial is a boolean variable that verifies data in a the serial number input
  const [serial, setserial] = useState(false);
  // req is a boolean variable that verifies data in all the input fields.
  const [pd, setpd] = useState(false)

  const [req, setreq] = useState(false);

  /**
   * addVehicles function will run a http request and add new vehicle inputted by user
   *
   * @param  {object} e the 'e' will be used to prevent redirecting caused by forms.
   */
  const addVehiclesList = (e) => {
    e.preventDefault();
    if (!long) {
      setlongValidate(false);
    }
    if (!lat) {
      setlatValidate(false);
    }

    if (!bat) {
      setbatteryValidate(false);
    }


    if (!serial) {
      setserialNumberValidate(false);
    }
    if(!pd){
      setpurchaseDateValidate(false)
    }

    if (long && lat && bat && serial && pd) {
      // http request to add a new vehicle to the database
      axios
        .post("/api/vehicles/add", {
          vehicle_type: String(Type),
          color: color,
          manufacturer: manufacturer,
          serial_number: String(SerialNumber),
          wear: VehicleWear,
          purchase_date: PurchaseDate,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          battery: Number(battery),
        })
        .then(function (response) {
          setTimeout(() => {
            // calling redux store to send http request response to our saved state
            AddNewVehicleID(response.data);
            history.push(`/vehicledetail/${response.data}`);
          }, 1000);
        })
        .catch(function (error) { });
    }
  };

  /**
   * batteryNumber function will run to check user input
   *
   * @param  {object} e is the argument of the event handler attached to the onChange event of the battery input field.
   */
  const batteryNumber = (e) => {
    setbattery(e.target.value);
    // running check to see if value if accepted
    if (isNaN(e.target.value) || e.target.value == "" || e.target.value > 100 || e.target.value < 0 || e.target.value.includes(".")) {
      setbat(false)
    } else {
      setbat(true)
      setbatteryValidate(true)
    }
  }

  /**
   * latNumber function will run to check user input
   *
   * @param  {object} e is the argument of the event handler attached to the onChange event of the latitude input field.
   */
  const latNumber = (e) => {
    setlatitude(e.target.value);
    // running check to see if value if accepted
    if (isNaN(e.target.value) || e.target.value == "" || e.target.value > 90 || e.target.value < -90) {
      setlat(false)
    } else {
      setlat(true)
      setlatValidate(true)
    }
  }

  /**
   * longNumber function will run to check user input
   *
   *  @param  {object} e is the argument of the event handler attached to the onChange event of the longitude input field.
   */
  const longNumber = (e) => {
    setlongitude(e.target.value);
    // running check to see if value if accepted
    if (isNaN(e.target.value) || e.target.value == "" || e.target.value > 180 || e.target.value < -180) {
      setlong(false)
    } else {
      setlong(true)
      setlongValidate(true)
    }
  }

  /**
   * colorNumber function will run to check user input
   *
   * @param  {object} e is the argument of the event handler attached to the onChange event of the color input field.
   */
  const colorNumber = (e) => {
    setcolor(e.target.value);
  };

  /**
   * serialNumber function will run to check user input
   *
   * @param  {object} e is the argument of the event handler attached to the onChange event of the serial number input field.
   */
  const serialNumber = (e) => {
    setSerialNumber(e.target.value);
    // running check to see if value if accepted
    if (isNaN(e.target.value) || e.target.value == "" || (Number(e.target.value) < 0) || Number.isInteger(Number(e.target.value)) == false || e.target.value.includes(".")|| e.target.value.includes("-")|| e.target.value.includes("+")) {
      setserial(false)
    } else {
      setserial(true)
      setserialNumberValidate(true)
    }
  }

  const purchaseDate = (e) => {
    setPurchaseDate(e.target.value)
    // running check to see if value if accepted
    if (e.target.value == "") {
      setpd(false)
    } else {
      setpd(true)
      setpurchaseDateValidate(true)
    }
  }


  /**
   * rideType function will run to check user input
   *
   * @param  {object} e is the argument of the event handler attached to the onChange event of the ride type input field.
   */
  const rideType = (e) => {
    setType(e.target.value);
  };
  return (
    <div className="container" style={{ paddingLeft: "0px", paddingRight: "0px" }}>
      <h1 style={{ margin: "20px", textAlign: 'center', fontSize: "43px" }}>Add a vehicle</h1>
      <div style={{ display: "flex", justifyContent: 'start', alignItems: "center", marginTop: "20px", marginBottom: "90px", width: "800px" }}>
        <div style={{ width: "400px" }}>
          <form>
            <div class="form-group">
              <label for="exampleInputEmail1">Type</label>
              <select className="form-control" onChange={rideType} style={{ height: "calc(1.5em + 1.125rem + 2px)" }}>
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Skateboard">Skateboard</option>
              </select>
            </div>
            <div class="form-group">
              <label for="exampleInputPassword1">Longitude</label>
              <input onChange={longNumber} style={{ height: "calc(1.5em + 1.125rem + 2px)" }} type="text" class="form-control" />
              {longValidate === false ? <div><p>Longitude must be between -180 and 180.</p></div> : null}
            </div>
            <div class="form-group">
              <label for="exampleInputPassword1">Latitude</label>
              <input onChange={latNumber} style={{ height: "calc(1.5em + 1.125rem + 2px)" }} type="text" class="form-control" />
              {latValidate === false ? <div><p>Latitude must be between -90 and 90.</p></div> : null}
            </div>
            <div class="form-group">
              <label for="exampleInputPassword1">Battery (percent)</label>
              <input onChange={batteryNumber} style={{ height: "calc(1.5em + 1.125rem + 2px)" }} type="text" class="form-control" />
              {batteryValidate === false ? <div><p>Not a valid integer value</p><p>Battery (percent) must be between 0 and 100</p></div> : null}

            </div>
            <div class="form-group">
              <label for="exampleInputPassword1">Color</label>
              <input onChange={colorNumber} style={{ height: "calc(1.5em + 1.125rem + 2px)" }} type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label for="exampleInputEmail1">Manufacturer</label>
              <input onChange={(e) => setmanufacturer(e.target.value)} style={{ height: "calc(1.5em + 1.125rem + 2px)" }} type="email" class="form-control" />
            </div>
            <div class="form-group">
              <label for="exampleInputPassword1">Serial Number</label>
              <input onChange={serialNumber} style={{ height: "calc(1.5em + 1.125rem + 2px)" }} type="text" class="form-control" />
              {serialNumberValidate === false ? <div><p>Please input a positive integer for serial number.</p></div> : null}
            </div>
            <div class="form-group">
              <label for="exampleInputPassword1">Vehicle Wear</label>
              <input onChange={(e) => setVehicleWear(e.target.value)} style={{ height: "calc(1.5em + 1.125rem + 2px)" }} type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label for="exampleInputEmail1">Purchase Date</label>
              <input onChange={purchaseDate} style={{ height: "calc(1.5em + 1.125rem + 2px)" }} type="text" class="form-control" />
              {purchaseDateValidate === false ? <div><p>Please input a date.</p></div> : null}
            </div>

            <Link onMouseDown={addVehiclesList} class="btn btn-danger form-control" style={{ backgroundColor: '#FF3565', height: "calc(1.5em + 1.125rem + 2px)" }}>Add vehicle</Link>
          </form>
        </div>
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
  vehicles: state.data.vehicles,
  email: state.data.email,
  newVehicleID: state.data.newVehicleID,
});

export default connect(mapStateToProps, { AddNewVehicleID })(AddVehicles);
