import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    // will add specific reducers here later
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
