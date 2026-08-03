export const TransactionList = ({ data }: any) => {
    return (
      <div>
        {data.map((t: any) => (
          <div key={t.id}>
            {t.type === "expense" ? "支出" : "収入"} / {t.title} / {t.amount}円
          </div>
        ))}
      </div>
    );
  };