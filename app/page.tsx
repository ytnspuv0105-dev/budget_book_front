"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchData = async () => {
    const res = await fetch("http://localhost:8000/api/transactions");
    const data = await res.json();
    setTransactions(data.data);
  };

  const createSample = async () => {
    await fetch("http://localhost:8000/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "テスト支出",
        amount: 500,
        type: "expense",
        date: "2026-05-02",
        category_id: 1,
      }),
    });

    await fetchData(); // ← これがキモ

    alert("登録成功");
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>収支一覧</h1>

      <button onClick={createSample}>
        テスト登録
      </button>

      {transactions.map((t) => (
        <div key={t.id}>
          {t.type === "expense" ? "支出" : "収入"} / {t.title} / {t.amount}円
        </div>
      ))}
    </div>
  );
}