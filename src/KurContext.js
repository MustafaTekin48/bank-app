import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// KurContext oluşturuluyor
export const KurContext = createContext();

// Sağlayıcı bileşen
export const KurProvider = ({ children }) => {
  const [kurlar, setKurlar] = useState({ USD: "", EUR: "", GA: "" });
  const kurRef = doc(db, "ayarlar", "kur");

  useEffect(() => {
    const fetchKur = async () => {
      const snapshot = await getDoc(kurRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setKurlar({
          USD: data.USD?.toString() || "",
          EUR: data.EUR?.toString() || "",
          GA: data.GA?.toString() || "",
        });
      }
    };

    fetchKur();
  }, []); // 🔕 Artık uyarı vermez

  const updateKur = async (newKurlar) => {
    const cleaned = {
      USD: newKurlar.USD === "" ? null : parseFloat(newKurlar.USD),
      EUR: newKurlar.EUR === "" ? null : parseFloat(newKurlar.EUR),
      GA: newKurlar.GA === "" ? null : parseFloat(newKurlar.GA),
    };

    await setDoc(kurRef, cleaned);
    setKurlar({
      USD: cleaned.USD?.toString() || "",
      EUR: cleaned.EUR?.toString() || "",
      GA: cleaned.GA?.toString() || "",
    });
  };

  return (
    <KurContext.Provider value={{ kurlar, updateKur }}>
      {children}
    </KurContext.Provider>
  );
};

// Hook ile kullanmak için
export const useKur = () => useContext(KurContext);
