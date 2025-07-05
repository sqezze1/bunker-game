import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!name.trim()) return alert("Введите имя");
    if (!room.trim()) return alert("Введите код комнаты");
    navigate(`/lobby?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}`);
  };

  const handleCreateRoom = () => {
    const newRoom = Math.random().toString(36).substring(2, 7).toUpperCase();
    setRoom(newRoom);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4">
      <div className="bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center mb-6">
          Добро пожаловать в <span className="text-yellow-400">Бункер</span> 🔐
        </h1>

        <input
          type="text"
          placeholder="Ваше имя"
          className="w-full p-3 mb-4 rounded-xl bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Код комнаты"
            className="flex-1 p-3 rounded-xl bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button
            onClick={handleCreateRoom}
            title="Случайный код"
            className="p-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl text-black font-bold"
          >
            🎲
          </button>
        </div>

        <button
          onClick={handleJoin}
          className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl text-lg font-semibold transition duration-200"
        >
          Присоединиться
        </button>
      </div>
    </div>
  );
}

export default Home;
