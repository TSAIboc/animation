import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

const initialState = {
    state: 'Idle',
    isButtonClick: false
}
const keyboardSlice = createSlice({
    name: 'keyboard',
    initialState,
    reducers: {
        excutebotAction(state, action) {
            state.state = action.payload;
            console.log(1);
        },
        excuteButtonClick(state, action) {
            state.isButtonClick = !state.isButtonClick;
            console.log(2);
        }
    }
});

export const { excutebotAction, excuteButtonClick } = keyboardSlice.actions;
export const stateSeletor = (state: RootState) => state.action;
export default keyboardSlice.reducer;