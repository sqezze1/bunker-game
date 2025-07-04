import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";

export default function Lobby() {
  const query = new URLSearchParams(useLocation().search);
  const name = query.get("name") || "Игрок";
  const room = query.get("room") || "ROOM";

  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    const roomRef = doc(db, "rooms", room);

    const joinRoom = async () => {
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        await setDoc(roomRef, {
          players: [name],
        });
      } else {
        await updateDoc(roomRef, {
          players: arrayUnion(name),
        });
      }

      // Подписка на обновления игроков
      onSnapshot(roomRef, (docSnap) => {
        const data = docSnap.data();
        if (data?.players) {
          setPlayers(data.players);
        }
      });
    };

    joinRoom();
  }, [room, name]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Комната: {room}</h2>

        <h3 className="text-lg mb-2">Игроки в комнате:</h3>
        <ul className="bg-gray-700 rounded-lg p-4 space-y-2 mb-4">
          {players.map((player, idx) => (
            <li key={idx} className="bg-gray-600 rounded p-2">
              {player}
            </li>
          ))}
        </ul>

        <button
          className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl text-lg font-semibold"
          onClick={() => alert("Начать игру (пока заглушка)")}
        >
          🚀 Начать игру
        </button>
      </div>
    </div>
  );
}
