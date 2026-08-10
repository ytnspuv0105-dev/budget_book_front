"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: "expense" | "income";
  date: string;
  category_id: number;
};

export default function Page() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<"expense" | "income">("expense");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchData = async () => {
    try {
      if (!API_URL) throw new Error("APIのURLが設定されていません");

      const res = await fetch(`${API_URL}/api/transactions`);
      if (!res.ok) throw new Error(`取得に失敗しました: ${res.status}`);

      const data = await res.json();
      setTransactions(data.data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "一覧を取得できませんでした");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense };
  }, [transactions]);

  const createTransaction = async () => {
    if (!title.trim() || !amount) {
      setError("タイトルと金額を入力してください");
      return;
    }

    const res = await fetch(`${API_URL}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        amount: Number(amount),
        type,
        date: new Date().toISOString().slice(0, 10),
        category_id: 1,
      }),
    });

    if (!res.ok) {
      setError("登録に失敗しました");
      return;
    }

    setTitle("");
    setAmount("");
    await fetchData();
  };

  const deleteTransaction = async (id: number) => {
    if (!confirm("この収支を削除しますか？")) return;

    await fetch(`${API_URL}/api/transactions/${id}`, {
      method: "DELETE",
    });

    await fetchData();
  };

  const updateTransaction = async (id: number) => {
    const res = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        amount: Number(editAmount),
        type: editType,
        date: new Date().toISOString().slice(0, 10),
        category_id: 1,
      }),
    });

    if (!res.ok) {
      setError("更新に失敗しました");
      return;
    }

    setEditingId(null);
    await fetchData();
  };

  const yen = (value: number) => `¥${value.toLocaleString("ja-JP")}`;

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>PERSONAL FINANCE</p>
          <h1>収支管理</h1>
          <p>毎日の収入と支出をシンプルに記録しましょう。</p>
        </header>

        <section className={styles.summary}>
          <div className={styles.summaryCard}>
            <span>残高</span>
            <strong>{yen(summary.balance)}</strong>
          </div>
          <div className={`${styles.summaryCard} ${styles.incomeCard}`}>
            <span>収入</span>
            <strong>+{yen(summary.income)}</strong>
          </div>
          <div className={`${styles.summaryCard} ${styles.expenseCard}`}>
            <span>支出</span>
            <strong>-{yen(summary.expense)}</strong>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionLabel}>NEW TRANSACTION</p>
              <h2>収支を登録</h2>
            </div>
          </div>

          <div className={styles.form}>
            <input
              className={styles.input}
              placeholder="例：ランチ、給与"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className={styles.input}
              type="number"
              placeholder="金額"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              className={styles.select}
              value={type}
              onChange={(e) => setType(e.target.value as "expense" | "income")}
            >
              <option value="expense">支出</option>
              <option value="income">収入</option>
            </select>
            <button className={styles.primaryButton} onClick={createTransaction}>
              登録する
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionLabel}>HISTORY</p>
              <h2>収支一覧</h2>
            </div>
            <span className={styles.count}>{transactions.length} 件</span>
          </div>

          {loading ? (
            <p className={styles.empty}>読み込み中...</p>
          ) : transactions.length === 0 ? (
            <p className={styles.empty}>まだ収支がありません。</p>
          ) : (
            <div className={styles.transactionList}>
              {transactions.map((t) => (
                <div className={styles.transaction} key={t.id}>
                  {editingId === t.id ? (
                    <div className={styles.editForm}>
                      <input
                        className={styles.input}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <input
                        className={styles.input}
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                      />
                      <select
                        className={styles.select}
                        value={editType}
                        onChange={(e) =>
                          setEditType(e.target.value as "expense" | "income")
                        }
                      >
                        <option value="expense">支出</option>
                        <option value="income">収入</option>
                      </select>
                      <button
                        className={styles.saveButton}
                        onClick={() => updateTransaction(t.id)}
                      >
                        保存
                      </button>
                      <button
                        className={styles.cancelButton}
                        onClick={() => setEditingId(null)}
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={styles.transactionInfo}>
                        <span
                          className={
                            t.type === "income"
                              ? styles.incomeIcon
                              : styles.expenseIcon
                          }
                        >
                          {t.type === "income" ? "↓" : "↑"}
                        </span>
                        <div>
                          <strong>{t.title}</strong>
                          <small>{t.date}</small>
                        </div>
                      </div>

                      <div className={styles.transactionRight}>
                        <strong
                          className={
                            t.type === "income"
                              ? styles.incomeAmount
                              : styles.expenseAmount
                          }
                        >
                          {t.type === "income" ? "+" : "-"}
                          {yen(t.amount)}
                        </strong>
                        <div className={styles.actions}>
                          <button
                            className={styles.textButton}
                            onClick={() => {
                              setEditingId(t.id);
                              setEditTitle(t.title);
                              setEditAmount(String(t.amount));
                              setEditType(t.type);
                            }}
                          >
                            編集
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => deleteTransaction(t.id)}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}