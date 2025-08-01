import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

// Sayıyı otomatik binlik ayırıcıyla formatlar (1,234.56 gibi)
const formatWithCommas = (value) => {
  const [whole, decimal] = value.split(".");
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole;
};

// Formatlı string'i parse eder (1,234.56 → 1234.56)
const parseToFloat = (value) => {
  return parseFloat(value.replace(/,/g, ""));
};

const GelirGiderForm = ({ onIslem }) => {
  const [miktar, setMiktar] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [isGelir, setIsGelir] = useState(true);
  const [paraBirimi, setParaBirimi] = useState("TL");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numeric = parseToFloat(miktar);
    if (isNaN(numeric) || numeric <= 0) return;

    const yeniIslem = {
      miktar: numeric,
      aciklama,
      isGelir,
      paraBirimi,
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, "gelir_gider"), yeniIslem);

    setMiktar("");
    setAciklama("");
    setParaBirimi("TL");
    setIsGelir(true);
    if (onIslem) onIslem(isGelir ? "gelir" : "gider");
  };

  const handleMiktarChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");

    // Sadece bir tane nokta (.) kabul et
    if ((raw.match(/\./g) || []).length > 1) return;

    setMiktar(formatWithCommas(raw));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-lg font-bold">🧾 Gelir / Gider Ekle</h2>
      <input
        type="text"
        placeholder="Miktar (ör. 1,234.56)"
        value={miktar}
        onChange={handleMiktarChange}
        className="w-full border px-3 py-2 rounded"
      />
      <input
        type="text"
        placeholder="Açıklama"
        value={aciklama}
        onChange={(e) => setAciklama(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
      <div className="flex gap-2">
        <select value={paraBirimi} onChange={(e) => setParaBirimi(e.target.value)} className="flex-1 border p-2 rounded">
          <option value="TL">TL</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GA">GA</option>
        </select>
        <select value={isGelir ? "gelir" : "gider"} onChange={(e) => setIsGelir(e.target.value === "gelir")} className="flex-1 border p-2 rounded">
          <option value="gelir">Gelir</option>
          <option value="gider">Gider</option>
        </select>
      </div>
      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Kaydet</button>
    </form>
  );
};

export default GelirGiderForm;
