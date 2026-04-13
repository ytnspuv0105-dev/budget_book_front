export type Transaction = {
    id: number;
    title: string;
    amount: number;
    type: "income" | "expense";
    date: string;
  };