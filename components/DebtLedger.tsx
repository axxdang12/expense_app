import React from 'react';
import { Transaction, TransactionType, DebtType } from '../types';
import { calculateTotals, formatCurrency, calculateDebtStatus } from '../utils/transactionUtils';

interface DebtLedgerProps {
  transactions: Transaction[];
}

const DebtLedgerItem: React.FC<{debt: {original: Transaction, repaid: number, remaining: number}}> = ({ debt }) => {
    const repaymentPercentage = debt.original.amount > 0 ? (debt.repaid / debt.original.amount) * 100 : 0;

    return (
        <li className="bg-slate-50 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold text-text-primary">{debt.original.title}</p>
                    <p className="text-sm text-text-secondary">{debt.original.debtType === DebtType.LENT ? 'Cho vay' : 'Vay nợ'}</p>
                    <p className="text-xs text-text-secondary mt-1">Ngày: {new Date(debt.original.date).toLocaleDateString('vi-VN')}</p>
                    {debt.original.dueDate && <p className="text-xs text-text-secondary">Hạn trả: {new Date(debt.original.dueDate).toLocaleDateString('vi-VN')}</p>}
                </div>
            </div>
            <div className="mt-3">
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-medium text-text-primary">
                        Còn lại: <span className="font-bold">{formatCurrency(debt.remaining)}</span>
                    </span>
                    <span className="text-xs text-text-secondary">
                        Tổng: {formatCurrency(debt.original.amount)}
                    </span>
                </div>
                 <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${repaymentPercentage}%` }}></div>
                </div>
            </div>
        </li>
    )
}


const DebtLedger: React.FC<DebtLedgerProps> = ({ transactions }) => {
  const debtStatus = React.useMemo(() => calculateDebtStatus(transactions), [transactions]);
  const debtList = Object.values(debtStatus);
  
  const lentTransactions = debtList.filter(d => d.original.debtType === DebtType.LENT);
  const borrowedTransactions = debtList.filter(d => d.original.debtType === DebtType.BORROWED);
  
  const { totalLent, totalBorrowed } = calculateTotals(transactions);

  if (debtList.length === 0) {
    return <p className="text-center text-text-secondary mt-8">Chưa có khoản vay/nợ nào. Nhấn nút + để thêm.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
        <div className="bg-amber-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-amber-600 uppercase">Tổng cho vay (còn lại)</h3>
          <p className="text-2xl font-semibold text-amber-800 mt-1">{formatCurrency(totalLent)}</p>
        </div>
        <div className="bg-slate-200 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-slate-600 uppercase">Tổng vay nợ (còn lại)</h3>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{formatCurrency(totalBorrowed)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {lentTransactions.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Khoản cho vay</h3>
            <ul className="space-y-3">
              {lentTransactions.map(t => <DebtLedgerItem key={t.original.id} debt={t} />)}
            </ul>
          </div>
        )}

        {borrowedTransactions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-text-primary mb-2">Khoản vay nợ</h3>
            <ul className="space-y-3">
              {borrowedTransactions.map(t => <DebtLedgerItem key={t.original.id} debt={t} />)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtLedger;