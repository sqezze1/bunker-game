import { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (name.trim() === "") return alert("Введите имя");
    if (room.trim() === "") return alert("Введите код комнаты");
    navigate(`/lobby?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}`);
  };

  const handleCreateRoom = () => {
    const newRoom = Math.random().toString(36).substring(2, 7).toUpperCase();
    setRoom(newRoom);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Добро пожаловать в Бункер 🔐</h1>

        <input
          type="text"
          placeholder="Ваше имя"
          className="w-full p-2 rounded bg-gray-700 mb-3 text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Код комнаты"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 px-3 rounded"
            onClick={handleCreateRoom}
          >
            🎲
          </button>
        </div>

        <button
          onClick={handleJoin}
          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded mt-2"
        >
          Присоединиться
        </button>
      </div>
    </div>
  );
}

export default App;
