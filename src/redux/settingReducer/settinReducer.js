import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  staticData: null,
  category: null,
  pageLoader: true,
  footerdata : null,
  searchvalue : null,
  banner :null
};

const settingSlice = createSlice({
  name: "SettingData",
  initialState,
  reducers: {
    handleSetSticData: (state, action) => {
      state.staticData = action.payload;
    },
    handleCategory: (state, action) => {
      state.category = action.payload;
    },
    handlePageloader: (state, action) => {
      state.pageLoader = action.payload;
    },
    handleFooterData: (state, action) => {
      state.footerdata = action.payload;
    },
    handleSearchValue: (state, action) => {
      state.searchvalue = action.payload;
    },
    handleBanner: (state, action) => {
      state.banner = action.payload;
    },  
  },
});

export const { handleSetSticData, handleCategory, handlePageloader,handleFooterData,handleSearchValue,handleBanner } =
  settingSlice.actions;

export default settingSlice.reducer;
