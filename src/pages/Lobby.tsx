import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateCard } from "../utils/generateCard";
import { generateScenario } from "../utils/generateScenario";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  getDocs,
  collection
} from "firebase/firestore";

export default function Lobby() {
  const query = new URLSearchParams(useLocation().search);
  const name = query.get("name") || "Игрок";
  const room = query.get("room") || "ROOM";
  const navigate = useNavigate();

  const [players, setPlayers] = useState<string[]>([]);
  const [host, setHost] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);  // Добавлен флаг для отслеживания начала игры

  useEffect(() => {
    const roomRef = doc(db, "rooms", room);

    const joinRoom = async () => {
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        await setDoc(roomRef, {
          players: [name],
          host: name,
        });
        setHost(name);
      } else {
        const roomData = roomSnap.data();
        setHost(roomData?.host || null);

        await updateDoc(roomRef, {
          players: arrayUnion(name),
        });
      }

      localStorage.setItem("playerName", name);

      await setDoc(
        doc(db, "rooms", room, "players", name), // rooms/{room}/players/{имя}
        {},                                      // пока пустой
        { merge: true }                          // чтобы не стереть card позже
      );

      onSnapshot(roomRef, (docSnap) => {
        const data = docSnap.data();
        if (data?.players) setPlayers(data.players);
        if (data?.host) setHost(data.host);
        if (data?.started && !gameStarted) {
          // Если игра началась, перенаправляем игроков
          setGameStarted(true);  // Устанавливаем флаг о начале игры
          navigate(`/scenario/${room}`);  // Перенаправление на сцену игры
        }
      });
    };

    joinRoom();
  }, [room, name, gameStarted, navigate]);

  const isHost = host === name;

  const startGame = async () => {
    const playersSnapshot = await getDocs(collection(db, "rooms", room, "players"));
    const players = playersSnapshot.docs;

    // 1. Генерируем карточки для каждого игрока
    for (const docSnap of playersSnapshot.docs) {
      const playerName = docSnap.id; 
      await setDoc(
        doc(db, "rooms", room, "players", playerName),
        { card: generateCard() },
        { merge: true }
      );
    }

    const scenario = generateScenario(players.length);

    await updateDoc(doc(db, "rooms", room), {
      scenario,
      started: true,
    });
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Комната: {room}</h2>

        <h3 className="text-lg mb-2">Игроки в комнате:</h3>
        <ul className="bg-gray-700 rounded-lg p-4 space-y-2 mb-4">
          {players.map((player, idx) => (
            <li key={idx} className="bg-gray-600 rounded p-2">
              {player} {player === host && "(👑 Хост)"}
            </li>
          ))}
        </ul>

        {isHost && (
          <button
            onClick={startGame}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl text-white font-semibold"
          >
            Начать игру
          </button>
        )}
      </div>
    </div>
  );
}
