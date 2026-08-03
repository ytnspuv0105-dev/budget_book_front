"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [transactions, setTransactions] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState("expense");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchData = async () => {
    const res = await fetch(`${API_URL}/api/transactions`);
    const data = await res.json();
    setTransactions(data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createTransaction = async () => {
    await fetch(`${API_URL}/api/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        amount: Number(amount),
        type,
        date: "2026-05-02",
        category_id: 1,
      }),
    });

    await fetchData();
    setTitle("");
    setAmount("");
  };

  const deleteTransaction = async (id: number) => {
    if (!confirm("削除しますか？")) return;

    await fetch(`${API_URL}/api/transactions/${id}`, {
      method: "DELETE",
    });

    await fetchData();
  };

  // 👇 追加（更新処理）
  const updateTransaction = async (id: number) => {
    await fetch(`${API_URL}/api/transactions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editTitle,
        amount: Number(editAmount),
        type: editType,
        date: "2026-05-02",
        category_id: 1,
      }),
    });

    setEditingId(null);
    await fetchData();
  };

  return (
    <div>
      <h1>収支一覧</h1>

      {/* 登録フォーム */}
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
        <button onClick={createTransaction}>登録</button>
      </div>

      {/* 一覧 */}
      {transactions.map((t) => (
        <div key={t.id}>
          {editingId === t.id ? (
            // 👇 編集モード
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
              >
                <option value="expense">支出</option>
                <option value="income">収入</option>
              </select>

              <button onClick={() => updateTransaction(t.id)}>保存</button>
              <button onClick={() => setEditingId(null)}>キャンセル</button>
            </>
          ) : (
            // 👇 表示モード
            <>
              {t.type === "expense" ? "支出" : "収入"} / {t.title} / {t.amount}円

              <button
                onClick={() => {
                  setEditingId(t.id);
                  setEditTitle(t.title);
                  setEditAmount(String(t.amount));
                  setEditType(t.type);
                }}
              >
                編集
              </button>

              <button onClick={() => deleteTransaction(t.id)}>
                削除
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}