import type { Transaction } from "@/types/transaction";

type TransactionListProps = {
  data: Transaction[];
};

export const TransactionList = ({ data }: TransactionListProps) => {
  return (
    <div>
      {data.map((t) => (
        <div key={t.id}>
          {t.type === "expense" ? "支出" : "収入"} / {t.title} / {t.amount}
          円
        </div>
      ))}
    </div>
  );
};
