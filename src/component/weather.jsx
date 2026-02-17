import { createTheme, ThemeProvider } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CloudIcon from "@mui/icons-material/Cloud";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import axios from "axios";
import InputAdornment from "@mui/material/InputAdornment";
import { Button } from "@mui/material";
import moment from "moment";
import "moment/min/locales";
import { useDispatch, useSelector } from "react-redux";
import { featchWeather } from "../features/WeatherSlice";
import { CircularProgress } from "@mui/material";

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: "IBM",
      color: "#fff",
    },
  },
});

export default function Weather({ t, i18n }) {
  const WeatherData = useSelector((state) => state.Weather1.WeatherData);
  const dispatch = useDispatch();
  const APIKey = "175a2ba6b144b3cde06f16b3e434e59a";
  const keyMap = "04ff1740-cef7-490c-8ab1-26ff270f6e2a";

  const [dateTime, setDateTime] = useState(
    moment().format("MMMM Do YYYY , h:mm:ss a"),
  );
  // const [WeatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState("");
  const [funEGO, setFunGeo] = useState(null);

  // ===== Time =====
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(moment().format("Do MMMM YYYY , h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, []);

  // ===== Toggle Language =====
  const toggleLang = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    moment.locale(newLang);

    if (funEGO) {
      featchGeo();
    }
  };

  // ===== GPS → IP =====
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          //position اختصار لل
          fetchCityFromCoords(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          fetchIP();
        },
      );
    } else {
      fetchIP();
    }
    // eslint-disable-next-line
  }, []);

  // ===== From GPS =====
  function fetchCityFromCoords(lat, lon) {
    axios
      .get(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${APIKey}&lang=${i18n.language}`,
      )
      .then((res) => {
        if (res.data.length > 0) {
          const place = res.data[0];
          setFunGeo({
            lat,
            lon,
            name: place.local_names?.[i18n.language] || place.name,
          });
          console.log("name", place.name);
          setCity(place.name);
        }
      })
      .catch((err) => console.log(err));
  }

  // ===== IP Fallback =====

  function fetchIP() {
    axios
      .get(`https://apiip.net/api/check?accessKey=${keyMap}`)
      .then((res) => {
        console.log(res.data);
        const { latitude, longitude, city } = res.data;

        setFunGeo({ lat: latitude, lon: longitude, name: city });
        setCity(city);
      })
      .catch((err) => console.log(err));
  }

  // ===== Search City =====
  function featchGeo() {
    if (!city.trim()) {
      alert(t("emptyCity"));
      return;
    }

    axios
      .get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIKey}&lang=${i18n.language}`,
      )
      .then((res) => {
        if (res.data.length === 0) {
          alert(t("wrongCity"));
          return;
        }

        const data = res.data[0];
        console.log("geo data", data);
        setFunGeo({
          ...data,
          name: data.local_names?.[i18n.language] || data.name,
        });
      })
      .catch(() => alert(t("serverError")));
  }

  // ===== Weather =====
  useEffect(() => {
    if (!funEGO) return;
    dispatch(
      featchWeather({
        lat: funEGO.lat,
        lon: funEGO.lon,
        language: i18n.language,
        t:t
      }),
    );
  }, [funEGO, i18n.language, dispatch,t]);
  //  APIتعني جلب البيايات من ال  fetch
  // ===== UI =====
  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="sm"
        sx={{
          background: "linear-gradient(135deg, #023A72, #01528a)",
          borderRadius: "20px",
          padding: "20px",
          marginTop: "50px",
          boxShadow: "0 0 25px rgba(0,0,0,0.3)",
        }}
      >
        {/* ========== Search Bar ========== */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <TextField
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && featchGeo()}
            placeholder={t("writeCity")}
            variant="outlined"
            sx={{
              mt: 2,
              mb: 2,
              width: "100%",
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset, &:hover fieldset, &.Mui-focused fieldset": {
                  border: "none",
                },
                color: "white",
                textAlign: "center",
              },
              "& input": {
                color: "white",
                textAlign: "center",
              },
            }}
            inputProps={{
              style: { direction: "ltr", textAlign: "center" },
            }}
            InputProps={{
              style: { direction: "ltr" },
              endAdornment: (
                <InputAdornment position="end">
                  <button
                    style={{
                      color: "white",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={featchGeo}
                  >
                    <SearchIcon />
                    <p style={{ fontSize: "17px" }}>{t("search")}</p>
                  </button>
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* ========== City Name + Date ========== */}
        <div
          style={{
            direction: i18n.language === "en" ? "ltr" : "rtl",
          }}
        >
          <div>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {funEGO?.name || <CircularProgress />}
            </Typography>

            <Typography>
              {dateTime}
              <br />
              {/* {Time} */}
            </Typography>
          </div>

          <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} />

          {/* ========== Main Weather Info ========== */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
            }}
          >
            {/* Right */}
            <div style={{ position: "relative" }}>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                {WeatherData?.temp ? (
                  `${Math.round(WeatherData.temp)}°C`
                ) : (
                  <CircularProgress />
                )}

                {WeatherData && (
                  <img
                    src={`https://openweathermap.org/img/wn/${WeatherData.icon}@2x.png`}
                    alt=""
                    style={{
                      width: "60px",
                      position: "absolute",
                      top: "-10px",
                    }}
                  />
                )}
              </Typography>

              <Typography sx={{ fontSize: "18px", opacity: 0.8 }}>
                {WeatherData ? WeatherData.description : t("loading")}
              </Typography>
            </div>

            {/* Left */}
            <CloudIcon sx={{ fontSize: "120px", opacity: 0.8 }} />
          </div>

          {/* ========== Footer Temps ========== */}
          <div style={{ marginTop: "20px", marginBottom: "10px" }}>
            <Typography
              sx={{ display: "flex", gap: "15px", justifyContent: "center" }}
            >
              <span>
                {WeatherData
                  ? ` ${t("maxTemp")} : ${Math.ceil(WeatherData.temp_max)}°C `
                  : "..."}
              </span>
              |
              <span>
                {WeatherData
                  ? `${t("minTemp")} : ${Math.floor(WeatherData.temp_min)}°C  `
                  : "..."}
              </span>
            </Typography>
          </div>
          <Button value="Enter" onClick={() => toggleLang()} variant="outlined">
            {t("language")}
          </Button>
        </div>
      </Container>
    </ThemeProvider>
  );
}
