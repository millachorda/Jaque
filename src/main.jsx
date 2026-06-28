import React from "react";
import { createroot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createroot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);