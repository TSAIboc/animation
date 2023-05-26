import { configureStore } from "@reduxjs/toolkit";
import keyboardSlice from "./keyboardSlice";

const store = configureStore({
    reducer: {
        action: keyboardSlice,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store;