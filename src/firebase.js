// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase projenizin yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyBbq0pjEunx4w1rUuJONXlWyDhbSaxjawo",
  authDomain: "kumbaraapp-24e30.firebaseapp.com",
  projectId: "kumbaraapp-24e30",
  storageBucket: "kumbaraapp-24e30.firebasestorage.app",
  messagingSenderId: "760598747605",
  appId: "1:760598747605:web:abdb8016643088772d455c"
};

// Firebase'i başlatıyoruz
const app = initializeApp(firebaseConfig);

// Firestore veritabanı bağlantısını alıyoruz
const db = getFirestore(app);

export { db }; // db'yi dışa aktararak kullanmamızı sağlıyoruz
