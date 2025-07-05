// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx"; // Главная страница
import Lobby from "./pages/Lobby.tsx"; // Страница лобби
import Scenario from "./pages/Scenario.tsx"; // Страница сценария
import Game from "./pages/Game";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Главная страница */}
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/scenario/:roomId" element={<Scenario />} />
        <Route path="/game/:roomId" element={<Game />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
