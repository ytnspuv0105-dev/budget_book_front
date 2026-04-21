"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:8000/api/transactions");
      const data = await res.json();

      // ← ここ重要
      setTransactions(data.data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>収支一覧</h1>

      {transactions.map((t) => (
        <div key={t.id}>
          {t.type === "expense" ? "支出" : "収入"} / {t.title} / {t.amount}円
        </div>
      ))}
    </div>
  );
}