export type TransactionType = "income" | "expense";

export type Transaction = {
  id: number;
  title: string | null;
  amount: number;
  type: TransactionType;
  date: string;
  category_id: number;
};

export type TransactionInput = Omit<Transaction, "id">;

export type TransactionListResponse = {
  data: Transaction[];
  meta: Record<string, unknown>;
};
