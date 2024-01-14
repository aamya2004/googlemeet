import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from './slice'

const store = configureStore({
    reducer: userReducer,
})

export default store;