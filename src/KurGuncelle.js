import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import updateAnim from "./animations/update.json";

const KurGuncelle = () => {
  const [formData, setFormData] = useState({ USD: "", EUR: "", GA: "" });
  const [showAnim, setShowAnim] = useState(false);

  const kurRef = doc(db, "ayarlar", "kur");

  // İlk başta verileri Firestore'dan al
  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDoc(kurRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setFormData({
          USD: data.USD !== null && data.USD !== undefined ? data.USD.toString() : "",
          EUR: data.EUR !== null && data.EUR !== undefined ? data.EUR.toString() : "",
          GA: data.GA !== null && data.GA !== undefined ? data.GA.toString() : "",
        });
      }
    };
    fetchData();
  }, []);

  // Input değişimlerini işler
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Boşsa direkt boş bırak
    if (value === "") {
      setFormData((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    // Noktalı sayıya çevir, virgülü noktaya çevir
    let temiz = value.replace(",", ".").replace(/^0+(?=\d)/, "");

    const sayi = parseFloat(temiz);
    if (!isNaN(sayi)) {
      setFormData((prev) => ({ ...prev, [name]: temiz }));
    }
  };

  // Firestore'a kaydet
  const handleSave = async () => {
    const cleaned = {
      USD: formData.USD === "" ? null : parseFloat(formData.USD),
      EUR: formData.EUR === "" ? null : parseFloat(formData.EUR),
      GA: formData.GA === "" ? null : parseFloat(formData.GA),
    };

    await setDoc(kurRef, cleaned);
    setShowAnim(true);
    setTimeout(() => setShowAnim(false), 2000);
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-6 mt-6 border border-gray-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">💱 Kur Güncelle</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {["USD", "EUR", "GA"].map((kur) => (
          <div key={kur}>
            <label className="block text-sm text-gray-600 mb-1">{kur}</label>
            <input
              type="text"
              name={kur}
              value={formData[kur]}
              onChange={handleChange}
              placeholder="Örn: 32.50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Kaydet
      </button>

      <AnimatePresence>
        {showAnim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="w-[300px] h-[300px]">
              <Lottie animationData={updateAnim} loop={false} />
            </div>
            <p className="text-lg font-bold text-blue-700 mt-2">Kurlar güncellendi!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default KurGuncelle;
