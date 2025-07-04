import { useLocation } from "react-router-dom";

function Lobby() {
  const query = new URLSearchParams(useLocation().search);
  const name = query.get("name");
  const room = query.get("room");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Комната: {room}</h2>
        <p className="text-lg">Добро пожаловать, {name}!</p>
        <p className="text-sm mt-4">Здесь будет список игроков и кнопка "Начать игру"</p>
      </div>
    </div>
  );
}

export default Lobby;
