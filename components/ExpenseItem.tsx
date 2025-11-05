import React from 'react';
import { Transaction, TransactionType, DebtType } from '../types';
import CategoryIcon from './CategoryIcon';
import { formatCurrency } from '../utils/transactionUtils';

export interface DebtInfo {
  repaid: number;
  remaining: number;
}

interface ExpenseItemProps {
  transaction: Transaction;
  debtInfo: DebtInfo | null;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ transaction, debtInfo }) => {
  const isExpense = transaction.type === TransactionType.EXPENSE;
  const isDebt = transaction.type === TransactionType.DEBT;

  const getSubtext = () => {
    if (isDebt) {
        if (transaction.debtType === DebtType.LENT) {
            return `Cho ${transaction.title} vay`;
        }
        return `Vay từ ${transaction.title}`;
    }
    return transaction.category;
  }

  const getDueDateText = () => {
    if (isDebt && transaction.dueDate) {
      const dueDate = new Date(transaction.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isOverdue = dueDate < today;
      return (
        <span className={`text-xs ${isOverdue ? 'text-red-500' : 'text-text-secondary'}`}>
          Hạn trả: {dueDate.toLocaleDateString('vi-VN')}
        </span>
      );
    }
    return null;
  };
  
  return (
    <li className="flex items-center justify-between bg-slate-50 p-3 rounded-lg shadow-sm hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-4">
        <CategoryIcon transaction={transaction} />
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">
            {transaction.title}
          </span>
          <span className="text-sm text-text-secondary">{getSubtext()}</span>
          <span className="text-xs text-text-secondary mt-1">{new Date(transaction.date).toLocaleDateString('vi-VN')}</span>
          {getDueDateText()}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
            <p className={`font-bold ${isExpense ? 'text-red-500' : isDebt ? 'text-amber-500' : 'text-green-500'}`}>
              {isDebt && debtInfo ? (
                <>
                  <span className="block">{formatCurrency(debtInfo.remaining)}</span>
                   {debtInfo.repaid > 0 && <span className="text-xs font-normal text-text-secondary block">Đã trả: {formatCurrency(debtInfo.repaid)}</span>}
                </>
              ) : (
                <>
                  {isExpense ? '-' : (transaction.type === TransactionType.INCOME ? '+' : '')}{formatCurrency(transaction.amount)}
                </>
              )}
            </p>
        </div>
      </div>
    </li>
  );
};

export default ExpenseItem;