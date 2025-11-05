import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  eventuser: null,
  userType : null,
};

const eventUserSlice = createSlice({
  name: "EventUser",
  initialState,
  reducers: {
    handleEventUser: (state, action) => {
      state.eventuser = action.payload;
    },
    handleEventUserTypeSelected: (state, action) => {
        state.userType = action.payload
    },
  },
});

export const { handleEventUser, handleEventUserTypeSelected } = eventUserSlice.actions;

export default eventUserSlice.reducer;
