const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchTransactions = async () => {
  const res = await fetch(`${API_URL}/api/transactions`);
  return res.json();
};