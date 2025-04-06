import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App.tsx";
import "./index.css";
import Event from "./pages/Event.tsx";
import JoinEvent from "./pages/JoinEvent.tsx";
import { EventProvider } from "./contexts/EventContext.tsx";
import { AppProvider } from "./contexts/AppContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <Toaster richColors closeButton />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/join/:eventId" element={<JoinEvent />} />
          <Route
            path="/event/:eventId"
            element={
              <EventProvider>
                <Event />
              </EventProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
);
