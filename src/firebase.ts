// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBME0008qLZX8NgKbD39yLLAYtIxGmBO2I",
  authDomain: "bunker-game-f8333.firebaseapp.com",
  projectId: "bunker-game-f8333",
  storageBucket: "bunker-game-f8333.firebasestorage.app",
  messagingSenderId: "785749860646",
  appId: "1:785749860646:web:e87808b253f94527e261e7"
};

export const db = getFirestore(initializeApp(firebaseConfig));