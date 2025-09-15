import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css"; // ✅ make sure global styles are included

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
