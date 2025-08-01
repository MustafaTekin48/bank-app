import React, { useState } from "react";
import ToplamBakiye from "./ToplamBakiye";
import GelirGiderForm from "./GelirGiderForm";
import IslemListesi from "./IslemListesi";
import HedefBelirle from "./HedefBelirle";
import KurGuncelle from "./KurGuncelle";
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import gelirAnim from "./animations/income.json";
import giderAnim from "./animations/expense.json";
import hedefAnim from "./animations/target.json";
import { KurProvider } from "./KurContext";

const App = () => {
  const [toplamBakiye, setToplamBakiye] = useState(0);
  const [sonIslem, setSonIslem] = useState(null);

  const handleIslemAnimasyonu = (tip) => {
    setSonIslem(tip);
    setTimeout(() => setSonIslem(null), 2500);
  };

  return (
    <KurProvider>
      <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 to-blue-100 p-4 md:p-10 font-sans overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🧠 <span>Kumbara</span>
            </h1>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </span>
          </header>

          <ToplamBakiye setToplamBakiye={setToplamBakiye} />

          <div className="grid md:grid-cols-2 gap-6">
            <GelirGiderForm onIslem={handleIslemAnimasyonu} />
            <HedefBelirle
              toplamBakiye={toplamBakiye}
              onHedefEkle={() => handleIslemAnimasyonu("hedef")}
            />
          </div>

          <IslemListesi />
          <KurGuncelle />

          <footer className="text-center text-xs text-gray-400 mt-12">
            © {new Date().getFullYear()} Kumbara. Tüm hakları saklıdır.
          </footer>
        </div>

        <AnimatePresence>
          {sonIslem && (
            <motion.div
              key={sonIslem}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="w-[400px] h-[400px]">
                <Lottie
                  animationData={
                    sonIslem === "gelir"
                      ? gelirAnim
                      : sonIslem === "gider"
                      ? giderAnim
                      : hedefAnim
                  }
                  loop={false}
                />
              </div>
              <p
                className={`mt-4 text-xl font-bold ${
                  sonIslem === "gelir"
                    ? "text-green-700"
                    : sonIslem === "gider"
                    ? "text-red-700"
                    : "text-blue-700"
                }`}
              >
                {sonIslem === "gelir"
                  ? "Gelir eklendi!"
                  : sonIslem === "gider"
                  ? "Gider kaydedildi..."
                  : "Yeni hedef eklendi!"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </KurProvider>
  );
};

export default App;
