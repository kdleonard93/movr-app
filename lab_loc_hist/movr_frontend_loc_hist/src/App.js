import React, { useEffect, useState } from 'react';
import './App.css';
import { HashRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Home from './components/pages/Home/Home';
import NavBar from './components/layouts/NavBar';
import Dashboard from './components/pages/Dashboard/Dashboard';
import Rides from './components/pages/Rides/Rides';
import AddVehicles from './components/pages/AddVehicles/AddVehicles';
import Profile from './components/pages/profile/Profile'
import {connect} from 'react-redux'
import VehicleDetails from './components/pages/VehicleDetails/VehicleDetails';
import RideDetails from './components/pages/RideDetails/RideDetails';
import { logins, navbar } from './redux/actions';
import Registration from './components/pages/Registration/Registration'

function App({login,logins,email,location}) {
const [navLocation, setnavLocation] = useState("")
const [userName, setuserName] = useState("")

  useEffect(() => {
    let user = sessionStorage.getItem("user")
    setuserName(user)

    if(user != null){
      logins(user)
    }
 
    if(location == '/' || location == '/register'){
        setnavLocation(false)
    }else{
        setnavLocation(true)
    }

    console.log("Log in status :"+login)
  }, [navLocation, location,userName])


  const LoginContainer = () => (
    <div>
      <Route exact path="/" render={() => <Redirect to="/" />} />
      <Route path="/" component={Home} />
    </div>
  )

  const VehiclesContainer = () => (
    <div>
      <Route  path="/vehicles" render={() => <Redirect to="/vehicles" />} />
      <Route path="/" component={Dashboard} />
    </div>
  )

  const RegisterContainer = () => (
    <div>
      <Route exact path="/register" render={() => <Redirect to="/register" />} />
      <Route path="/register" component={Registration} />
    </div>
  )

  return (
<Router>
  {/* {login != true ? null : <NavBar/>} */}
  <NavBar/>
  <Switch>
    <Route exact path='/' component={login != true ? LoginContainer : VehiclesContainer}/>
    <Route path='/register' component={RegisterContainer}/>
    <Route path='/vehicles' component={Dashboard}/>
    <Route path='/rides' component={Rides}/>
    <Route path='/addvehicles' component={AddVehicles}/>
    <Route path='/vehicledetail/:id' component={VehicleDetails}/>
    <Route path='/vehicledetail' component={VehicleDetails}/>
    <Route path='/ridedetail/:id/:view' component={RideDetails}/>
    <Route path='/profile' component={Profile}/>
  </Switch>
</Router>        
  );
}

const mapStateToProps = (state) => ({
  login:state.data.login,
  email:state.data.email,
  location:state.data.location,
})

export default connect(mapStateToProps, {logins})(App);
