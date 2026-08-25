"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createCategory as createCategoryRequest,
  createTransaction as createTransactionRequest,
  deleteTransaction as deleteTransactionRequest,
  getApiErrorMessage,
  getCategories,
  getTransactions,
  updateCategory as updateCategoryRequest,
  updateTransaction as updateTransactionRequest,
} from "@/lib/api";
import type { Category } from "@/types/category";
import type {
  Transaction,
  TransactionType,
} from "@/types/transaction";
import styles from "./page.module.css";

export default function Page() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<TransactionType>("expense");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDate, setEditDate] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [editCategoryName, setEditCategoryName] = useState("");

  const fetchData = async () => {
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        getTransactions(),
        getCategories(),
      ]);

      setTransactions(transactionsData.data);
      setCategories(categoriesData);

      setCategoryId(
        (current) => current || String(categoriesData[0]?.id ?? "")
      );

      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "一覧を取得できませんでした"));
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

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  const createTransaction = async () => {
    if (!amount || !categoryId || !date) {
      setError("金額、日付、カテゴリを入力してください");
      return;
    }

    try {
      await createTransactionRequest({
        title,
        amount: Number(amount),
        type,
        date,
        category_id: Number(categoryId),
      });

      setTitle("");
      setAmount("");
      setDate(new Date().toISOString().slice(0, 10));

      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "登録に失敗しました"));
    }
  };

  const deleteTransaction = async (id: number) => {
    if (!confirm("この収支を削除しますか？")) return;

    try {
      await deleteTransactionRequest(id);
      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "削除に失敗しました"));
    }
  };

  const updateTransaction = async (id: number) => {
    if (!editAmount || !editCategoryId || !editDate) {
      setError("金額、日付、カテゴリを入力してください");
      return;
    }
    try {
      await updateTransactionRequest(id, {
        title: editTitle,
        amount: Number(editAmount),
        type: editType,
        date: editDate,
        category_id: Number(editCategoryId),
      });

      setEditingId(null);
      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "更新に失敗しました"));
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await createCategoryRequest({ name: newCategoryName });

      setNewCategoryName("");
      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "カテゴリの追加に失敗しました"));
    }
  };

  const updateCategory = async (id: number) => {
    if (!editCategoryName.trim()) return;

    try {
      await updateCategoryRequest(id, { name: editCategoryName });

      setEditingCategoryId(null);
      setEditCategoryName("");
      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "カテゴリの更新に失敗しました"));
    }
  };

  const categoryName = (id: number) => {
    return categories.find((category) => category.id === id)?.name ?? "未分類";
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
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
            onChange={(e) =>
              setType(e.target.value as TransactionType)
            }
          >
            <option value="expense">支出</option>
            <option value="income">収入</option>
          </select>

          <select
            className={styles.select}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">カテゴリ</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            className={styles.input}
            placeholder="タイトル（任意）"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button className={styles.primaryButton} onClick={createTransaction}>
            登録する
          </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionLabel}>CATEGORIES</p>
              <h2>カテゴリ管理</h2>
            </div>
          </div>

          <div className={styles.categoryForm}>
            <input
              className={styles.input}
              placeholder="例：交通費、趣味"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />

            <button className={styles.primaryButton} onClick={createCategory}>
              追加する
            </button>
          </div>

          <div className={styles.categoryList}>
            {categories.map((category) => (
              <div className={styles.categoryRow} key={category.id}>
                {editingCategoryId === category.id ? (
                  <>
                    <input
                      className={styles.input}
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                    />

                    <button
                      className={styles.saveButton}
                      onClick={() => updateCategory(category.id)}
                    >
                      保存
                    </button>

                    <button
                      className={styles.cancelButton}
                      onClick={() => setEditingCategoryId(null)}
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <>
                    <span>{category.name}</span>

                    <button
                      className={styles.textButton}
                      onClick={() => {
                        setEditingCategoryId(category.id);
                        setEditCategoryName(category.name);
                      }}
                    >
                      編集
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
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
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
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
                          setEditType(e.target.value as TransactionType)
                        }
                      >
                        <option value="expense">支出</option>
                        <option value="income">収入</option>
                      </select>

                      <select
                        className={styles.select}
                        value={editCategoryId}
                        onChange={(e) => setEditCategoryId(e.target.value)}
                      >
                        <option value="">カテゴリ</option>

                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>

                      <input
                        className={styles.input}
                        placeholder="タイトル（任意）"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <div className={styles.editActions}>
                        <button
                          className={styles.cancelButton}
                          onClick={() => setEditingId(null)}
                        >
                          キャンセル
                        </button>

                        <button
                          className={styles.saveButton}
                          onClick={() => updateTransaction(t.id)}
                        >
                          保存
                        </button>
                      </div>
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
                          <small>{categoryName(t.category_id)}</small>
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
                              setEditTitle(t.title ?? "");
                              setEditAmount(String(t.amount));
                              setEditDate(t.date);
                              setEditType(t.type);
                              setEditCategoryId(String(t.category_id));
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
