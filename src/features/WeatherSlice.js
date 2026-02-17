import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
  const APIKey = "175a2ba6b144b3cde06f16b3e434e59a";
export const featchWeather =createAsyncThunk("weatherApi",async({lat,lon,language,t},thunkAPI)=>{
  try{
    if(!lat||!lon){
      return thunkAPI.rejectWithValue("latitude and longitude are required");
    }
const response= await axios
       
      .get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}&lang=${language}`,
      )
 
 console.log("the responce is",response.data);
const data = response.data;
    
return {
  temp: data.main.temp- 273.15,
  temp_max: data.main.temp_max- 273.15,
  temp_min: data.main.temp_min- 273.15,
  icon: data.weather[0].icon,
  description: t(data.weather[0].description),
 }}
catch(error){

 console.log("ErrorApi",error.message)

  return thunkAPI.rejectWithValue(error.message); 
}
})

export const WeatherSlice = createSlice({
  name: "Weather",
  initialState: {
    value:"Egypt",
    isLoading:false,
    WeatherData:null,
    error:null
  },
  reducers: {
    // WeatherResult:(state, action)=> {
    //   state.value = action.payload.change;
    //   console.log(action)
    // },
  },
  extraReducers(builder){
builder.addCase(featchWeather.pending,(state )=>{
    state.isLoading = true;
console.log("pending");
state.error=null;
})
.addCase(featchWeather.fulfilled,( state,action)=>{
  console.log("fullfiled");
  state.isLoading = false;
state.WeatherData=action.payload;
// console.log("action",action)
})
.addCase(featchWeather.rejected,(state,action )=>{
  state.isLoading = false;
   state.error=action.payload;
  console.log("rejected : ",state.error);
 
})
  }
});
export const {WeatherResult}=WeatherSlice.actions
export default WeatherSlice.reducer;
