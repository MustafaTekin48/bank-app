import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useKur } from "./KurContext";

const IslemListesi = () => {
  const [veriler, setVeriler] = useState([]);
  const { kurlar } = useKur();

  // FİLTRE STATE'LERİ
  const [search, setSearch] = useState("");
  const [paraBirimiFilter, setParaBirimiFilter] = useState("Tümü");
  const [tipFilter, setTipFilter] = useState("Tümü");

  useEffect(() => {
    const q = query(collection(db, "gelir_gider"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gelenVeriler = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVeriler(gelenVeriler);
    });
    return () => unsubscribe();
  }, []);

  const getTLKarsilik = (veri) => {
    if (veri.paraBirimi === "TL" || !veri.paraBirimi) return null;
    const kur = parseFloat(kurlar[veri.paraBirimi]) || 0;
    return veri.miktar * kur;
  };

  // FİLTRELİ VERİ LİSTESİ
  const filtreliVeriler = veriler.filter((veri) => {
    const uyumluBirim = paraBirimiFilter === "Tümü" || veri.paraBirimi === paraBirimiFilter;
    const uyumluTip = tipFilter === "Tümü" || (tipFilter === "Gelir" && veri.isGelir) || (tipFilter === "Gider" && !veri.isGelir);
    const uyumluMetin = veri.aciklama?.toLowerCase().includes(search.toLowerCase()) || false;
    return uyumluBirim && uyumluTip && uyumluMetin;
  });

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-6 mt-6 border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📜 <span>İşlem Geçmişi</span>
      </h2>

      {/* FİLTRELER */}
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <input
          type="text"
          placeholder="🔍 Açıklama ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-auto flex-1"
        />
        <select
          value={paraBirimiFilter}
          onChange={(e) => setParaBirimiFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="Tümü">💱 Tüm Para Birimleri</option>
          <option value="TL">TL</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GA">GA</option>
        </select>
        <select
          value={tipFilter}
          onChange={(e) => setTipFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="Tümü">🔁 Tümü</option>
          <option value="Gelir">➕ Gelir</option>
          <option value="Gider">➖ Gider</option>
        </select>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <AnimatePresence>
          {filtreliVeriler.map((veri) => {
            const tlKarsilik = getTLKarsilik(veri);
            return (
              <motion.div
                key={veri.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className={`flex justify-between items-center p-4 rounded-xl border text-sm shadow-sm transition-all duration-300 ${
                  veri.isGelir ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
                }`}
              >
                <div>
                  <p className="text-gray-700 font-medium">
                    {veri.aciklama || <em className="text-gray-400 italic">[Açıklama yok]</em>}
                  </p>
                  <p className="text-xs text-gray-400">
                    {veri.createdAt?.seconds
                      ? new Date(veri.createdAt.seconds * 1000).toLocaleDateString()
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-base ${
                      veri.isGelir ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {veri.isGelir ? "+" : "-"}{" "}
                    {new Intl.NumberFormat("tr-TR").format(veri.miktar)} {veri.paraBirimi || "TL"}
                  </p>
                  {tlKarsilik !== null && (
                    <p className="text-xs text-gray-500">
                      (≈{" "}
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(tlKarsilik)}
                      )
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default IslemListesi;
