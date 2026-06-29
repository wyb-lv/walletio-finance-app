export const parseExpenseDate = (date = "") => {
  if (!date) return new Date(0);
  if (date.includes("/")) {
    const [day, month, year] = date.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
};

export const getExpenseMonthKey = (expense) => {
  const date = parseExpenseDate(expense.expense_date ?? expense.date);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const formatMonthKey = (key) => {
  const [year, month] = key.split("-");
  return `Tháng ${Number(month)}/${year}`;
};

export const getDirection = (transaction) =>
  transaction.direction ?? (transaction.type === "income" ? "in" : "out");

export const enrichExpenses = ({
  transactions = [],
  wallets = [],
  categories = [],
  emotions = [],
}) => {
  const walletById = new Map(wallets.map((wallet) => [wallet.id, wallet]));
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const categoryByName = new Map(
    categories.map((category) => [category.name, category]),
  );
  const emotionById = new Map(
    emotions.map((emotion) => [emotion.id, emotion]),
  );

  return transactions
    .filter((transaction) => transaction.type === "expense")
    .map((transaction) => {
      const category =
        categoryById.get(transaction.categoryId) ??
        categoryByName.get(transaction.category);
      const wallet = walletById.get(transaction.walletId);
      const emotion = emotionById.get(transaction.emotionId);

      return {
        ...transaction,
        direction: getDirection(transaction),
        expense_date: transaction.expense_date ?? transaction.date,
        categoryName: category?.name ?? transaction.category,
        categoryIcon: category?.icon,
        categoryColor: category?.color,
        walletName: wallet?.name ?? transaction.walletName ?? "Ví tiền",
        emotionEmoji: emotion?.emoji ?? transaction.emotionEmoji ?? null,
        emotionLabel: emotion?.label ?? transaction.emotionLabel ?? null,
      };
    })
    .sort(
      (a, b) =>
        parseExpenseDate(b.expense_date).getTime() -
        parseExpenseDate(a.expense_date).getTime(),
    );
};
