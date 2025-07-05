// src/pages/PlayerCard.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  collection,
  getDocs,
} from "firebase/firestore";

// Типы карточки и сценария
type Card = {
  profession: string; age: string; health: string; phobia: string;
  skill: string; hobby: string; inventory: string; physique: string; fact: string;
};

const labels: Record<keyof Card, string> = {
  profession: "Профессия",
  age: "Возраст",
  health: "Здоровье",
  phobia: "Фобия",
  skill: "Навык",
  hobby: "Хобби",
  inventory: "Инвентарь",
  physique: "Телосложение",
  fact: "Факт",
};

type Scenario = {
  catastrophe: { name: string; description: string };
  bunker: {
    size: string; capacity: string; food: string; water: string;
    electricity: string; condition: string; security: string; communication: string;
  };
};

type Player = {
  card?: Card;
  revealed?: boolean;
};

export default function PlayerCard() {
  const { roomId } = useParams();
  const playerName = localStorage.getItem("playerName") || "Игрок";

  const [myCard, setMyCard] = useState<Card | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [players, setPlayers] = useState<Record<string, Player>>({});

  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);
    const playersRef = collection(db, "rooms", roomId, "players");

    const unsubScenario = onSnapshot(roomRef, (snap) => {
      const data = snap.data();
      if (data?.scenario) setScenario(data.scenario);
    });

    const fetchPlayers = async () => {
      const playerDocs = await getDocs(playersRef);
      const allPlayers: Record<string, Player> = {};
      playerDocs.forEach((doc) => {
        allPlayers[doc.id] = doc.data() as Player;
      });
      setPlayers(allPlayers);
      if (allPlayers[playerName]?.card) {
        setMyCard(allPlayers[playerName].card!);
      }
    };

    fetchPlayers();
    const unsubPlayers = onSnapshot(playersRef, fetchPlayers);

    return () => {
      unsubScenario();
      unsubPlayers();
    };
  }, [roomId, playerName]);

  if (!myCard || !scenario) {
    return <div className="text-white text-center mt-10">Загрузка данных...</div>;
  }

  const { catastrophe, bunker } = scenario;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-7xl">

        {/* Моя карточка */}
        <div className="bg-gray-900 p-4 rounded-xl shadow flex flex-col items-center text-center">
          <h2 className="text-xl font-bold mb-3">🧍 Моя карточка</h2>
          <ul className="space-y-1 text-sm">
            {Object.entries(myCard).map(([key, value]) => (
              <li key={key}>
                <b>{labels[key as keyof Card]}:</b> {value}
              </li>
            ))}
          </ul>
        </div>

        {/* Катастрофа и бункер */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">💥 {catastrophe.name}</h2>
          <p className="italic text-gray-300 mb-6 max-w-xl">{catastrophe.description}</p>

          <h3 className="text-xl font-semibold mb-4">🏠 Условия в бункере</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm max-w-2xl w-full">
            <li>📐 <b>Размер бункера:</b> {bunker.size}</li>
            <li>👥 <b>Максимальная вместимость:</b> {bunker.capacity}</li>
            <li>🥫 <b>Запас еды:</b> {bunker.food}</li>
            <li>💧 <b>Запас воды:</b> {bunker.water}</li>
            <li>⚡ <b>Наличие электричества:</b> {bunker.electricity}</li>
            <li>🏚️ <b>Состояние сооружения:</b> {bunker.condition}</li>
            <li>🔒 <b>Система безопасности:</b> {bunker.security}</li>
            <li>📡 <b>Средства связи:</b> {bunker.communication}</li>
          </ul>
        </div>

        {/* Другие игроки */}
        <div className="bg-gray-900 p-4 rounded-xl shadow">
          <h2 className="text-xl font-bold text-center mb-3">👥 Игроки</h2>
          <ul className="space-y-3 text-sm">
            {Object.entries(players).map(([name, data]) => (
              name === playerName ? null : (
                <li key={name} className="bg-gray-800 p-2 rounded-lg">
                  <b>{name}</b>
                  {data.revealed && data.card ? (
                    <ul className="mt-1 space-y-1">
                      {Object.entries(data.card).map(([key, value]) => (
                        <li key={key}><b>{labels[key as keyof Card]}:</b> {value}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-500">Карточка скрыта</p>
                  )}
                </li>
              )
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
