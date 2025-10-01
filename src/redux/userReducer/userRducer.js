import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  user: null,
  adminuser : null 
};

const userSlice = createSlice({
  name: "UserData",
  initialState,
  reducers: {
    handleUser: (state, action) => {
      state.user = action.payload;
    },
    handleAdminuser : (state ,action) =>{
        state.adminuser = action.payload
    }
  },
});

export const { handleUser,handleAdminuser } = userSlice.actions;

export default userSlice.reducer;
