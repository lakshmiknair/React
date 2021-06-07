import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from "redux-thunk";
import reducer from './reducer';
import userReducer from './userReducer';
export default combineReducers({
    reducer,
    userReducer
  });
  const rootReducer = combineReducers({
    contents: reducer,
    users: userReducer
  })
  
export const articleStore = createStore(rootReducer, applyMiddleware(thunk));