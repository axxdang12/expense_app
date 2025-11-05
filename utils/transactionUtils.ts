import { Transaction, TransactionType, DebtType, ExpenseCategory, IncomeCategory } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const calculateTotals = (transactions: Transaction[]) => {
  const debtStatus = calculateDebtStatus(transactions);
  
  let totalIncome = 0;
  let totalExpense = 0;
  
  transactions.forEach(t => {
    if (t.type === TransactionType.INCOME) {
      totalIncome += t.amount;
    } else if (t.type === TransactionType.EXPENSE) {
      totalExpense += t.amount;
    }
  });
  
  const totalLent = Object.values(debtStatus)
    .filter(d => d.original.debtType === DebtType.LENT)
    .reduce((sum, d) => sum + d.remaining, 0);

  const totalBorrowed = Object.values(debtStatus)
    .filter(d => d.original.debtType === DebtType.BORROWED)
    .reduce((sum, d) => sum + d.remaining, 0);

  const balance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, balance, totalLent, totalBorrowed };
};

export const calculateDebtStatus = (transactions: Transaction[]): Record<string, { original: Transaction; repaid: number; remaining: number }> => {
    const debtTransactions = transactions.filter(t => t.type === TransactionType.DEBT);
    const repaymentTransactions = transactions.filter(t => 
        (t.type === TransactionType.EXPENSE && t.category === ExpenseCategory.REPAYMENT) ||
        (t.type === TransactionType.INCOME && t.category === IncomeCategory.DEBT_COLLECTION)
    );

    const debtStatus: Record<string, { original: Transaction; repaid: number; remaining: number }> = {};

    debtTransactions.forEach(debt => {
        debtStatus[debt.id] = {
            original: debt,
            repaid: 0,
            remaining: debt.amount,
        };
    });

    repaymentTransactions.forEach(repayment => {
        if (repayment.relatedTransactionId && debtStatus[repayment.relatedTransactionId]) {
            const debt = debtStatus[repayment.relatedTransactionId];
            debt.repaid += repayment.amount;
            debt.remaining = Math.max(0, debt.original.amount - debt.repaid);
        }
    });

    return debtStatus;
};

export const processWeeklyData = (transactions: Transaction[]) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); 
  const startOfWeek = new Date(today);
  // Set to Monday of the current week
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const weekDayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const weeklyData = weekDayLabels.map(day => ({ name: day, income: 0, expense: 0 }));

  transactions.forEach(t => {
    const transactionDate = new Date(t.date);
    if (transactionDate >= startOfWeek && transactionDate <= endOfWeek) {
      let dayIndex = transactionDate.getDay();
      dayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Monday is 0, Sunday is 6

      if (t.type === TransactionType.INCOME) {
        weeklyData[dayIndex].income += t.amount;
      } else if (t.type === TransactionType.EXPENSE) {
        weeklyData[dayIndex].expense += t.amount;
      }
    }
  });

  return weeklyData;
};

export const processMonthlyExpenseData = (transactions: Transaction[]) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const monthlyExpenses: { [key: string]: number } = {};

  transactions.forEach(t => {
    const transactionDate = new Date(t.date);
    if (
      t.type === TransactionType.EXPENSE &&
      transactionDate >= startOfMonth &&
      transactionDate <= endOfMonth
    ) {
      const category = t.category as ExpenseCategory;
      if (!monthlyExpenses[category]) {
        monthlyExpenses[category] = 0;
      }
      monthlyExpenses[category] += t.amount;
    }
  });

  return Object.entries(monthlyExpenses)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};