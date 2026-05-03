"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [transactions, setTransactions] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");

  const fetchData = async () => {
    const res = await fetch("http://localhost:8000/api/transactions");
    const data = await res.json();
    setTransactions(data.data);
  };

  const createTransaction = async () => {
    await fetch("http://localhost:8000/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        amount,
        type,
        date: "2026-05-02",
        category_id: 1,
      }),
    });
  
    await fetchData();
  
    // 入力リセット
    setTitle("");
    setAmount("");
  };
  useEffect(() => {
    fetchData();
  }, []);

  const deleteTransaction = async (id: number) => {
    if (!confirm("削除しますか？")) {
      return;
    }
    await fetch(`http://localhost:8000/api/transactions/${id}`, {
      method: "DELETE",
    });
  
    await fetchData(); // 再取得
  };

  return (
    <div>
      <h1>収支一覧</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="金額"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">支出</option>
          <option value="income">収入</option>
        </select>
        <button onClick={createTransaction}>
          登録
        </button>
      </div>
      {transactions.map((t) => (
        <div key={t.id}>
          {t.type === "expense" ? "支出" : "収入"} / {t.title} / {t.amount}円
          <button onClick={() => deleteTransaction(t.id)}>
            削除
          </button>
        </div>
      ))}
    </div>
  );
}