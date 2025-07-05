import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby'; // Путь к вашему компоненту Lobby
import Scenario from './pages/Scenario'; // Путь к вашему компоненту Scenario

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Главная страница */}
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/scenario/:roomId" element={<Scenario />} />
      </Routes>
    </Router>
  );
}

export default App;
