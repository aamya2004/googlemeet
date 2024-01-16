import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userVideo: { id: "", active: false },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUserVideo: (state, action) => {
      state.userVideo.id = action.payload.id;
      state.userVideo.active = action.payload.active;
    },
  },
});

export const { addUserVideo } = userSlice.actions;
export const selectUserVideo = (state) => state.user.userVideo;
export default userSlice.reducer;
