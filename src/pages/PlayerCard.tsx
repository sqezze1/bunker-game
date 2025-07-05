import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

type Card = {
  profession: string; age: string; health: string; phobia: string;
  skill: string; hobby: string; inventory: string; physique: string; fact: string;
};

export default function PlayerCard() {
  const { roomId } = useParams();
  const name = localStorage.getItem("playerName")!;
  const [card, setCard] = useState<Card | null>(null);

  useEffect(() => {
    if (!roomId || !name) return;
    (async () => {
      const ref = doc(db, "rooms", roomId, "players", name);
      const snap = await getDoc(ref);
      if (snap.exists()) setCard(snap.data().card as Card);
    })();
  }, [roomId, name]);

  if (!card) return (
    <div className="text-white text-center mt-10">Загрузка карточки…</div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center mb-4">Ваша карточка</h2>
        <ul className="space-y-2">
          {Object.entries(card).map(([k, v]) => (
            <li key={k}>
              <strong className="capitalize">{k}:</strong> {v}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
