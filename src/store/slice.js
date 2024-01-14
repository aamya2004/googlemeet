import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userVideo : null,
}

const userSlice = createSlice({
    name : 'user',
    initialState,
    reducers : {
        addUserVideo : (state,action) => {
            console.log("done")
            state.userVideo = { id: action.payload.id, active: action.payload.active };
            console.log(state.userVideo);
        }
    }
})

export const{addUserVideo} = userSlice.actions;
export const selectUserVideo = state => state.user.userVideo;
export default userSlice.reducer;