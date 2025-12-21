import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import authReducer from "@/features/auth/authSlice";
import { userApi } from "@/features/user/userApi";
import { followApi } from "@/features/follow/followApi";
import { reviewApi } from "@/features/review/reviewApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [followApi.reducerPath]: followApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
  },
  middleware: (gDM) =>
    gDM().concat(
      api.middleware,
      userApi.middleware,
      followApi.middleware,
      reviewApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
