import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userReducer/userRducer"
import settingReducer from "./settingReducer/settinReducer"
import listingReducer from "./listinDynamicrouter/Listing"
import eventuserReducer from  "./eventuserReducer/eventuserReducer"
export const store = configureStore({
  reducer: {    
    users: userReducer ,
    setting : settingReducer,
    listing : listingReducer,
    eventUser : eventuserReducer
  },
});

