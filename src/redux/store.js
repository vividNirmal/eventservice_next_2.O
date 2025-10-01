import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userReducer/userRducer"
import settingReducer from "./settingReducer/settinReducer"
import listingReducer from "./listinDynamicrouter/Listing"

export const store = configureStore({
  reducer: {    
    users: userReducer ,
    setting : settingReducer,
    listing : listingReducer
  },
});

