import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

type Scenario = {
  catastrophe: {
    name: string;
    description: string;
  };
  bunker: {
    size: string;
    capacity: string;
    food: string;
    water: string;
    electricity: string;
    condition: string;
    security: string;
    communication: string;
  };
};

export default function Scenario() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    async function fetchScenario() {
      const ref = doc(db, "rooms", roomId!);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setScenario(snap.data().scenario);
      }
    }

    fetchScenario();
  }, [roomId]);

  if (!scenario) {
    return (
      <div className="text-white text-center mt-10">Загрузка сценария...</div>
    );
  }

  const { catastrophe, bunker } = scenario;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-3xl space-y-6">
        {/* Катастрофа */}
        <div>
          <h1 className="text-3xl font-bold text-red-500 text-center">
            💥 {catastrophe.name}
          </h1>
          <p className="text-gray-300 text-center mt-2 italic">
            {catastrophe.description}
          </p>
        </div>

        {/* Бункер */}
        <div>
          <h2 className="text-2xl font-semibold text-center mb-4">
            🛖 Условия в бункере
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
            <li>📐 <strong>Размер:</strong> {bunker.size}</li>
            <li>👥 <strong>Вместимость:</strong> {bunker.capacity}</li>
            <li>🥫 <strong>Еда:</strong> {bunker.food}</li>
            <li>💧 <strong>Вода:</strong> {bunker.water}</li>
            <li>⚡ <strong>Электричество:</strong> {bunker.electricity}</li>
            <li>🏚️ <strong>Состояние:</strong> {bunker.condition}</li>
            <li>🔒 <strong>Защита:</strong> {bunker.security}</li>
            <li>📡 <strong>Связь:</strong> {bunker.communication}</li>
          </ul>
        </div>

        {/* Кнопка продолжения */}
        <div className="text-center">
          <button
            onClick={() => navigate(`/game/${roomId}`)}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl mt-4 text-white font-semibold"
          >
            Перейти к карточкам игроков
          </button>
        </div>
      </div>
    </div>
  );
}
