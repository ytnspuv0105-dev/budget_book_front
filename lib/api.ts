import type { TransactionListResponse } from "@/types/transaction";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchTransactions = async (): Promise<TransactionListResponse> => {
  const res = await fetch(`${API_URL}/api/transactions`);
  return res.json();
};
