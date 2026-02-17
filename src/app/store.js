import { configureStore } from "@reduxjs/toolkit";
import WeatherReducer from "../features/WeatherSlice";
export const store = configureStore({
  reducer: { Weather1: WeatherReducer },
});
