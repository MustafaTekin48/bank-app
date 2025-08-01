import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion } from "framer-motion";
import { useKur } from "./KurContext";

const ToplamBakiye = ({ setToplamBakiye }) => {
  const [bakiyeTL, setBakiyeTL] = useState(0);
  const [bakiyeUSD, setBakiyeUSD] = useState(0);
  const [bakiyeEUR, setBakiyeEUR] = useState(0);
  const [bakiyeGA, setBakiyeGA] = useState(0);
  const { kurlar } = useKur();

  useEffect(() => {
    const q = query(collection(db, "gelir_gider"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let tl = 0, usd = 0, eur = 0, ga = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const miktar = data.isGelir ? data.miktar : -data.miktar;
        const birim = data.paraBirimi || "TL";

        if (birim === "USD") usd += miktar;
        else if (birim === "EUR") eur += miktar;
        else if (birim === "GA") ga += miktar;
        else tl += miktar;
      });

      setBakiyeTL(tl);
      setBakiyeUSD(usd);
      setBakiyeEUR(eur);
      setBakiyeGA(ga);

      const toplamTL =
        tl +
        usd * parseFloat(kurlar.USD || 0) +
        eur * parseFloat(kurlar.EUR || 0) +
        ga * parseFloat(kurlar.GA || 0);

      setToplamBakiye(toplamTL);
    });

    return () => unsubscribe();
  }, [kurlar, setToplamBakiye]);

  const formatTL = (value) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value);

  const tlUSD = bakiyeUSD * parseFloat(kurlar.USD || 0);
  const tlEUR = bakiyeEUR * parseFloat(kurlar.EUR || 0);
  const tlGA = bakiyeGA * parseFloat(kurlar.GA || 0);

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 space-y-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">💰 Toplam Bakiye (TL Karşılığı)</h2>
        <p className="text-3xl font-bold text-green-700">
          {formatTL(
            bakiyeTL + tlUSD + tlEUR + tlGA
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          TL Bakiye: <strong>{formatTL(bakiyeTL)}</strong>
        </div>
        <div>
          USD Bakiye: <strong>{bakiyeUSD.toFixed(2)} $</strong>
          <br /><span className="text-xs text-gray-500">(≈ {formatTL(tlUSD)})</span>
        </div>
        <div>
          EUR Bakiye: <strong>{bakiyeEUR.toFixed(2)} €</strong>
          <br /><span className="text-xs text-gray-500">(≈ {formatTL(tlEUR)})</span>
        </div>
        <div>
          Altın: <strong>{bakiyeGA.toFixed(2)} GA</strong>
          <br /><span className="text-xs text-gray-500">(≈ {formatTL(tlGA)})</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ToplamBakiye;
