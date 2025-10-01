import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ListingType: null,
  categoryDetails :null ,
  qoutationForm : false
};

const listingSlice = createSlice({
  name: "listingdata",
  initialState,
  reducers: {
    handleSetListingType: (state, action) => {
      state.ListingType = action.payload;
    },
    handlesetCategoryDetails:(state,action)=>{
      state.categoryDetails = action.payload
    },
    handleQoutation:(state, action)=>{
      state.qoutationForm = action.payload
    }
  },
});

export const { handleSetListingType,handlesetCategoryDetails,handleQoutation } = listingSlice.actions;

export default listingSlice.reducer;
