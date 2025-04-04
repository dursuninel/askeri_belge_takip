import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

import "./index.css";
import "./assets/css/app.css";

import App from "./App";

import 'react-toastify/dist/ReactToastify.css';
import 'primeicons/primeicons.css';
import "primereact/resources/themes/viva-light/theme.css";


import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

import { addLocale } from "primereact/api";

addLocale("tr", {
  firstDayOfWeek: 1,
  dayNames: [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ],
  dayNamesShort: ["Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cts"],
  dayNamesMin: ["Pa", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"],
  monthNames: [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ],
  monthNamesShort: [
    "Oca",
    "Şub",
    "Mar",
    "Nis",
    "May",
    "Haz",
    "Tem",
    "Ağu",
    "Eyl",
    "Eki",
    "Kas",
    "Ara",
  ],
  today: "Bugün",
  clear: "Temizle",
  dateFormat: "dd/mm/yy",
  weekHeader: "Hf",
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <UserProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </UserProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
