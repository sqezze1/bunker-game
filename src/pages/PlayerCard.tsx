// src/pages/PlayerCard.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  //getDoc,
  onSnapshot,
  collection,
  getDocs,
  //updateDoc,
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

    const unsub = onSnapshot(roomRef, (snap) => {
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
      unsub();
      unsubPlayers();
    };
  }, [roomId, playerName]);

  if (!myCard || !scenario) {
    return <div className="text-white text-center mt-10">Загрузка данных...</div>;
  }

  const { catastrophe, bunker } = scenario;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-8">
      {/* Катастрофа и бункер */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-500">💥 {catastrophe.name}</h2>
        <p className="italic text-gray-300 mb-4">{catastrophe.description}</p>

        <h3 className="text-xl font-semibold mb-2">🏠 Условия в бункере:</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <li>📐 <b>Размер:</b> {bunker.size}</li>
          <li>👥 <b>Вместимость:</b> {bunker.capacity}</li>
          <li>🥫 <b>Еда:</b> {bunker.food}</li>
          <li>💧 <b>Вода:</b> {bunker.water}</li>
          <li>⚡ <b>Электричество:</b> {bunker.electricity}</li>
          <li>🏚️ <b>Состояние:</b> {bunker.condition}</li>
          <li>🔒 <b>Безопасность:</b> {bunker.security}</li>
          <li>📡 <b>Связь:</b> {bunker.communication}</li>
        </ul>
      </div>

      {/* Моя карточка */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">🧍 Моя карточка</h2>
        <ul className="space-y-1">
          {Object.entries(myCard).map(([key, value]) => (
            <li key={key}><b>{labels[key as keyof Card]}:</b> {value}</li>
          ))}
        </ul>
      </div>

      {/* Другие игроки */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">👥 Игроки</h2>
        <ul className="space-y-4">
          {Object.entries(players).map(([name, data]) => (
            name === playerName ? null : (
              <li key={name} className="bg-gray-800 p-4 rounded-xl">
                <h3 className="font-bold">{name}</h3>
                {data.revealed && data.card ? (
                  <ul className="text-sm mt-1 space-y-1">
                    {Object.entries(data.card).map(([key, value]) => (
                      <li key={key}><b>{labels[key as keyof Card]}:</b> {value}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-gray-400">Карточка скрыта</p>
                )}
              </li>
            )
          ))}
        </ul>
      </div>
    </div>
  );
}
