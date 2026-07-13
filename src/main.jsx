import React from "react";
import { createRoot } from "react-dom/client";
import App from "./ui/App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);
