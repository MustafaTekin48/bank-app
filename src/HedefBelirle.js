import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import hedefAnim from "./animations/target.json";

// Sayıyı formatlamak için yardımcı fonksiyon
const formatNumber = (number) => {
  return new Intl.NumberFormat("tr-TR").format(number);
};

const HedefBelirle = ({ toplamBakiye, onHedefEkle }) => {
  const [hedefAdi, setHedefAdi] = useState("");
  const [hedefTutar, setHedefTutar] = useState("");
  const [aktifHedef, setAktifHedef] = useState(null);
  const [formGorunur, setFormGorunur] = useState(false);
  const [showAnim, setShowAnim] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "hedefler"), orderBy("tarih", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const hedefler = snapshot.docs.map((doc) => doc.data());
      if (hedefler.length > 0) setAktifHedef(hedefler[0]);
    });

    return () => unsub();
  }, []);

  const hedefKaydet = async (e) => {
    e.preventDefault();
    if (!hedefAdi || !hedefTutar) return;
    await addDoc(collection(db, "hedefler"), {
      hedefAdi,
      hedefTutar: parseFloat(hedefTutar.replace(/\./g, "")), // Veritabanına kaydederken formatı düzelt
      tarih: new Date(),
    });
    setHedefAdi("");
    setHedefTutar("");
    setFormGorunur(false);
    setShowAnim(true);
    setTimeout(() => setShowAnim(false), 2500);
  };

  const ilerleme =
    aktifHedef && aktifHedef.hedefTutar > 0
      ? Math.min((toplamBakiye / aktifHedef.hedefTutar) * 100, 100)
      : 0;

  const handleHedefTutarChange = (e) => {
    const raw = e.target.value.replace(/\D/g, ""); // Sayı dışı karakterleri kaldır
    const formatted = formatNumber(raw); // Sayıyı formatla
    setHedefTutar(formatted);
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-6 mt-6 border border-gray-200 relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🎯 <span>Hedef</span>
        </h2>
        {aktifHedef && (
          <button
            onClick={() => setFormGorunur(!formGorunur)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {formGorunur ? "İptal" : "+ Yeni Hedef"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {formGorunur || !aktifHedef ? (
          <motion.form
            onSubmit={hedefKaydet}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <input
              type="text"
              placeholder="Hedef (ör: Araba)"
              value={hedefAdi}
              onChange={(e) => setHedefAdi(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
            />
            <input
              type="text"
              placeholder="Hedef Tutarı (TL)"
              value={hedefTutar}
              onChange={handleHedefTutarChange} // Sayıyı formatla
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Hedefi Kaydet
            </button>
          </motion.form>
        ) : null}
      </AnimatePresence>

      {aktifHedef && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <p className="text-sm text-gray-600">
            Hedef: <strong>{aktifHedef.hedefAdi}</strong> – {new Intl.NumberFormat("tr-TR").format(aktifHedef.hedefTutar)} TL
          </p>
          <div className="w-full bg-gray-300 rounded-full h-4 mt-2">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${ilerleme}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-1 text-right">
            %{new Intl.NumberFormat("tr-TR", {
              maximumFractionDigits: 1,
            }).format(ilerleme)} tamamlandı
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {showAnim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="w-[400px] h-[400px]">
              <Lottie animationData={hedefAnim} loop={false} />
            </div>
            <p className="text-lg font-bold text-green-700 mt-2">Yeni hedef eklendi!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HedefBelirle;
