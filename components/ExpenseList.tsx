import React from 'react';
import { Transaction, TransactionType } from '../types';
import ExpenseItem, { DebtInfo } from './ExpenseItem';
import { calculateDebtStatus } from '../utils/transactionUtils';

interface ExpenseListProps {
  transactions: Transaction[];
}

const ExpenseList: React.FC<ExpenseListProps> = ({ transactions }) => {
  const debtStatus = React.useMemo(() => calculateDebtStatus(transactions), [transactions]);

  if (transactions.length === 0) {
    return <p className="text-center text-text-secondary mt-8">Chưa có giao dịch nào. Nhấn nút + để thêm.</p>;
  }
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-text-primary">Lịch sử giao dịch</h2>
      <ul className="space-y-3">
        {sortedTransactions.map((transaction) => {
          const debtInfo: DebtInfo | null = transaction.type === TransactionType.DEBT ? debtStatus[transaction.id] : null;
          return <ExpenseItem key={transaction.id} transaction={transaction} debtInfo={debtInfo} />;
        })}
      </ul>
    </div>
  );
};

export default ExpenseList;