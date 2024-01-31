//initial states of stored data which will be populated during application runtime.
const initialState = {
    vehicles: ["Char", "asd", "afdaf", "Char", "asd", "afdaf"],
    login: "",
    logout: "",
    email: "",
    newemail:"",
    deletedUser: "",
    registeredUser: "",
    ridestarted: "",
    rideended: "",
    vehicleID: null,
    newVehicleID: "",
    RideEndDetails: [],
    location:""
}


//a switch statement used to determine which state to call and change
const movr = (state = initialState, action) => {
    switch (action.type) {
        case 'DELETEDUSER':
            sessionStorage.clear();
            return {
                ...state,
                logout:"",
                login:"",
                deletedUser: action.payload.messages[0],
                email: null,
                newemail:""

            }
        case 'LOCATION':
            return {
                ...state,
                 location: action.payload
            }
        case 'VEHICLES':
            return {
                ...state,
                vehicles: action.payload
            }
        case 'NEWEMAIL':
            return{
                ...state,
                newemail:action.payload
            }
        case 'LOGIN':
            return {
                ...state,
                login: true,
                email: action.payload
            }
        case 'INCORRECT':
            return {
                ...state,
                login: false,
            }
        case 'LOGOUT':
            sessionStorage.clear();
            return {
                ...state,
                login: false,
                logout: false,
                email: null,
                vehicles: ["Char", "asd", "afdaf", "Char", "asd", "afdaf"],
                newemail:"",
                deletedUser: "",
                registeredUser: "",
                ridestarted: "",
                rideended: "",
                vehicleID: null,
                newVehicleID: "",
                RideEndDetails: [],
            }
        case 'RESET':
            return {
                ...state,
                login: "",
                logout: "",
                email: null            }
        case 'REMOVEDVEHICLE':
            return {
                ...state,
                vehicleID: action.payload
            }
        case 'RESETDASH':
            return {
                ...state,
                vehicleID: null,
                newVehicleID:"",
                RideEndDetails:[]
            }
        case 'NEWVEH':
            return{
                ...state,
                newVehicleID:action.payload
            }
        case 'RIDEENDED':
            return {
                ...state,
                RideEndDetails: action.payload
            }
        case 'STARTRIDE':
            return {
                ...state,
                ridestarted: true
            }
        case 'ENDRIDE':
            return {
                ...state,
                rideended: true
            }
        default:
            return state;
    }
}

export default movr;
