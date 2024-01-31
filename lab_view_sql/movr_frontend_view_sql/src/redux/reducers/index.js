import {combineReducers} from 'redux'
import data from './data'

//adding all reducers to one file. In our case, I only have one to add.
const reducers = combineReducers({
    data:data,
});

export default reducers
