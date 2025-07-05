// src/pages/PlayerCard.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  deleteDoc,
  onSnapshot,
  collection,
  updateDoc,
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
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [revealedFields, setRevealedFields] = useState<Record<string, string[]>>({});
  const [votes, setVotes] = useState<Record<string, string[]>>({});
  const [expelled, setExpelled] = useState<string[]>([]);
  const [phase, setPhase] = useState<"reveal" | "vote">("reveal");
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);
    const playersRef = collection(db, "rooms", roomId, "players");

    const unsubScenario = onSnapshot(roomRef, (snap) => {
      const data = snap.data();
      if (data?.scenario) setScenario(data.scenario);
      if (data?.currentTurn) setCurrentTurn(data.currentTurn);
      if (data?.revealedFields) setRevealedFields(data.revealedFields);
      if (data?.votes) setVotes(data.votes);
      if (data?.expelled) setExpelled(data.expelled);
      if (data?.phase) setPhase(data.phase);
      if (data?.gameOver) setGameOver(data.gameOver);
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

  useEffect(() => {
    const handleExit = async () => {
      if (!roomId || !playerName) return;

      try {
        await deleteDoc(doc(db, "rooms", roomId, "players", playerName));

        setTimeout(async () => {
          const snapshot = await getDocs(collection(db, "rooms", roomId, "players"));
          if (snapshot.empty) {
            await deleteDoc(doc(db, "rooms", roomId));
          }
        }, 1000);
      } catch (error) {
        console.error("Ошибка при выходе из комнаты:", error);
      }
    };

    window.addEventListener("beforeunload", handleExit);
    return () => {
      window.removeEventListener("beforeunload", handleExit);
    };
  }, [roomId, playerName]);

  const handleRevealField = async (field: keyof Card) => {
    if (!roomId || !playerName || !myCard || currentTurn !== playerName) return;

    const updated = [...(revealedFields[playerName] || []), field];

    await updateDoc(doc(db, "rooms", roomId), {
      [`revealedFields.${playerName}`]: updated,
    });

    const allNames = Object.keys(players);
    const currentIndex = allNames.indexOf(playerName);
    const nextIndex = (currentIndex + 1) % allNames.length;
    const nextPlayer = allNames[nextIndex];

    const everyoneRevealed = allNames.every(
      (name) => (revealedFields[name]?.length || 0) + (name === playerName ? 1 : 0) >= 1
    );

    if (everyoneRevealed) {
      await updateDoc(doc(db, "rooms", roomId), {
        phase: "vote",
        currentTurn: allNames[0],
      });
    } else {
      await updateDoc(doc(db, "rooms", roomId), {
        currentTurn: nextPlayer,
      });
    }
  };

  const handleVote = async (target: string) => {
    if (!roomId || !playerName || target === playerName || gameOver) return;

    const currentVotes = votes[target] || [];
    if (currentVotes.includes(playerName)) return;

    const updatedVotes = [...currentVotes, playerName];
    await updateDoc(doc(db, "rooms", roomId), {
      [`votes.${target}`]: updatedVotes,
    });

    const totalPlayers = Object.keys(players).length;
    if (updatedVotes.length > totalPlayers / 2) {
      const updatedExpelled = [...expelled, target];
      await updateDoc(doc(db, "rooms", roomId), {
        expelled: updatedExpelled,
      });

      const remaining = totalPlayers - updatedExpelled.length;
      const bunkerCapacity = parseInt(scenario!.bunker.capacity);
      if (remaining === bunkerCapacity) {
        await updateDoc(doc(db, "rooms", roomId), {
          gameOver: true,
        });
      }
    }

    const allNames = Object.keys(players);
    const currentIndex = allNames.indexOf(playerName);
    const nextIndex = (currentIndex + 1) % allNames.length;
    const nextPlayer = allNames[nextIndex];

    await updateDoc(doc(db, "rooms", roomId), {
      currentTurn: nextPlayer,
    });
  };

  if (!myCard || !scenario) {
    return <div className="text-white text-center mt-10">Загрузка данных...</div>;
  }

  const { catastrophe, bunker } = scenario;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10 space-y-10 text-lg">
      {gameOver && (
        <div className="text-center text-2xl text-yellow-400 font-bold p-6 bg-gray-800 rounded-xl">
          🏁 Игра окончена! Победители определены.
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Моя карточка */}
        <div className="bg-gray-900 p-8 rounded-2xl shadow-lg text-center space-y-4">
          <h2 className="text-2xl font-bold text-green-400">🧍 Моя карточка</h2>
          <p className={`font-semibold ${currentTurn === playerName ? "text-green-400" : "text-gray-400 italic"}`}>
            Ход игрока: {currentTurn === playerName ? `${currentTurn} (Вы)` : currentTurn}
          </p>
          <ul className="space-y-2 text-left">
            {Object.entries(myCard).map(([key, value]) => {
              const isMyTurn = currentTurn === playerName;
              const alreadyRevealed = revealedFields[playerName]?.includes(key);
              const canReveal = isMyTurn && !alreadyRevealed && phase === "reveal";

              return (
                <li key={key} className="flex justify-between items-center border-b border-gray-800 py-2">
                  <div>
                    <b>{labels[key as keyof Card]}:</b> {value}
                    <span className={`ml-2 text-sm ${alreadyRevealed ? "text-green-400" : "text-gray-400 italic"}`}>
                      ({alreadyRevealed ? "Открыто" : "Скрыто"})
                    </span>
                  </div>
                  {canReveal && (
                    <button
                      className="ml-4 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                      onClick={() => handleRevealField(key as keyof Card)}
                    >
                      Показать
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Катастрофа и бункер */}
        <div className="bg-gray-900 p-8 rounded-2xl shadow-lg text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-500">💥 {catastrophe.name}</h2>
          <p className="italic text-gray-300">{catastrophe.description}</p>
          <h3 className="text-xl font-semibold mt-4">🏠 Условия в бункере</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-left">
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

        {/* Игроки */}
        <div className="bg-gray-900 p-8 rounded-2xl shadow-lg text-center space-y-4">
          <h2 className="text-2xl font-bold">👥 Игроки</h2>
          <ul className="space-y-4 text-left">
            {Object.entries(players).map(([name, data]) => (
              name === playerName ? null : (
                <li key={name} className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition">
                  <h3 className="font-bold text-lg">{name}</h3>
                  {expelled.includes(name) ? (
                    <p className="text-red-400 italic mt-2">Игрок изгнан</p>
                  ) : (
                    <>
                      {data.card ? (
                        <ul className="mt-2 space-y-1 text-sm">
                          {Object.entries(data.card).map(([key, value]) => {
                            const isRevealed = revealedFields[name]?.includes(key);
                            return isRevealed ? (
                              <li key={key}><b>{labels[key as keyof Card]}:</b> {value}</li>
                            ) : null;
                          })}
                        </ul>
                      ) : (
                        <p className="italic text-gray-400 mt-1">Карточка скрыта</p>
                      )}

                      {phase === "vote" && currentTurn === playerName && !votes[name]?.includes(playerName) && (
                        <button
                          onClick={() => handleVote(name)}
                          className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                        >
                          Проголосовать против
                        </button>
                      )}
                    </>
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
