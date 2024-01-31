import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import stores from '../reducers'

const initialState ={}
//importing thunk for API calls in redux
const middleware = [thunk]
const store = createStore(stores, initialState, applyMiddleware(...middleware))


export default store;
