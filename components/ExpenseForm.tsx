import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, DebtType, ExpenseCategory, IncomeCategory, DebtCategory } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
// FIX: Import 'formatCurrency' to be used in the component.
import { formatCurrency } from '../utils/transactionUtils';

interface DebtStatus {
    [key: string]: {
        original: Transaction;
        repaid: number;
        remaining: number;
    }
}
interface ExpenseFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  transactions: Transaction[];
  debtStatus: DebtStatus;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddTransaction, onClose, transactions, debtStatus }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory | IncomeCategory | DebtCategory>(ExpenseCategory.FOOD);
  const [debtType, setDebtType] = useState<DebtType>(DebtType.BORROWED);
  const [dueDate, setDueDate] = useState('');
  const [relatedTransactionId, setRelatedTransactionId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isRepayment = type === TransactionType.EXPENSE && category === ExpenseCategory.REPAYMENT;
  const isDebtCollection = type === TransactionType.INCOME && category === IncomeCategory.DEBT_COLLECTION;

  useEffect(() => {
    if ((isRepayment || isDebtCollection) && relatedTransactionId && debtStatus[relatedTransactionId]) {
        const remaining = debtStatus[relatedTransactionId].remaining;
        setAmount(remaining);
    } else {
        // Clear amount if not a valid repayment/collection selection
        if(isRepayment || isDebtCollection) setAmount('');
    }
  }, [relatedTransactionId, category, type, debtStatus]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!title && !isRepayment && !isDebtCollection) || !amount || !date || (isRepayment && !relatedTransactionId) || (isDebtCollection && !relatedTransactionId)) {
      alert('Vui lòng điền đủ thông tin.');
      return;
    }

    let newTransaction: Omit<Transaction, 'id'>;

    if (type === TransactionType.DEBT) {
         newTransaction = { title, amount: +amount, date: new Date(date).toISOString(), type, category: DebtCategory.DEBT, debtType, dueDate: dueDate ? new Date(dueDate).toISOString() : undefined };
    } else {
        let finalTitle = title;
        if ((isRepayment || isDebtCollection) && relatedTransactionId) {
            const debt = debtStatus[relatedTransactionId].original;
            const verb = isRepayment ? 'Trả nợ cho' : 'Thu nợ từ';
            finalTitle = `${verb} ${debt.title}`;
        }
         newTransaction = { 
            title: finalTitle, 
            amount: +amount, 
            date: new Date(date).toISOString(), 
            type, 
            category,
            relatedTransactionId: (isRepayment || isDebtCollection) ? relatedTransactionId : undefined,
        };
    }
    
    onAddTransaction(newTransaction);
    onClose();
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: number | '' = e.target.value === '' ? '' : Number(e.target.value);

    if ((isRepayment || isDebtCollection) && relatedTransactionId && debtStatus[relatedTransactionId]) {
      const maxAmount = debtStatus[relatedTransactionId].remaining;
      if (value !== '' && value > maxAmount) {
        value = maxAmount;
      }
    }
    setAmount(value);
  }

  // FIX: The `value` variable is always a number here since it's initialized from the `suggestion`
  // parameter, but it was being compared to a string, causing a type error. This is corrected by
  // letting TypeScript infer `value` as a number and removing the redundant check.
  const handleSuggestionClick = (suggestion: number) => {
    let value = suggestion;
     if ((isRepayment || isDebtCollection) && relatedTransactionId && debtStatus[relatedTransactionId]) {
      const maxAmount = debtStatus[relatedTransactionId].remaining;
      if (value > maxAmount) {
        value = maxAmount;
      }
    }
    setAmount(value);
    setShowSuggestions(false);
  };
  
  const rawSuggestions = amount && typeof amount === 'number' && amount > 0 
    ? [amount * 1000, amount * 10000, amount * 100000].filter(s => s < 1000000000) 
    : [];

  let suggestions = rawSuggestions;
  if ((isRepayment || isDebtCollection) && relatedTransactionId && debtStatus[relatedTransactionId]) {
    const maxAmount = debtStatus[relatedTransactionId].remaining;
    suggestions = rawSuggestions.filter(s => s <= maxAmount);
  }


  const renderCategoryOptions = () => {
    const options = type === TransactionType.EXPENSE ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return options.map(c => <option key={c.value} value={c.value}>{c.label}</option>);
  };
  
  const availableDebts = Object.values(debtStatus)
    .filter(d => {
        if (d.remaining <= 0) return false;
        if (isRepayment) return d.original.debtType === DebtType.BORROWED;
        if (isDebtCollection) return d.original.debtType === DebtType.LENT;
        return false;
    });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-text-primary text-center mb-6">Thêm giao dịch mới</h2>
      
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
        <button type="button" onClick={() => { setType(TransactionType.EXPENSE); setCategory(ExpenseCategory.FOOD); setRelatedTransactionId(''); }} className={`p-2 rounded-md font-semibold text-sm transition ${type === TransactionType.EXPENSE ? 'bg-white shadow text-red-500' : 'text-text-secondary'}`}>Chi tiêu</button>
        <button type="button" onClick={() => { setType(TransactionType.INCOME); setCategory(IncomeCategory.SALARY); setRelatedTransactionId(''); }} className={`p-2 rounded-md font-semibold text-sm transition ${type === TransactionType.INCOME ? 'bg-white shadow text-green-500' : 'text-text-secondary'}`}>Thu nhập</button>
        <button type="button" onClick={() => { setType(TransactionType.DEBT); setCategory(DebtCategory.DEBT); setRelatedTransactionId(''); }} className={`p-2 rounded-md font-semibold text-sm transition ${type === TransactionType.DEBT ? 'bg-white shadow text-amber-500' : 'text-text-secondary'}`}>Vay/Nợ</button>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-secondary">
            {type === TransactionType.DEBT ? (debtType === DebtType.BORROWED ? 'Vay từ ai' : 'Cho ai vay') : 'Tên giao dịch'}
        </label>
        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" required={!isRepayment && !isDebtCollection} disabled={isRepayment || isDebtCollection} />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-text-secondary">Số tiền</label>
        <div className="relative">
          <input 
            type="number" 
            id="amount" 
            value={amount} 
            onChange={handleAmountChange} 
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Delay to allow suggestion click
            className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm no-spinner" 
            required 
            autoComplete="off"
          />
           {showSuggestions && suggestions.length > 0 && !(isRepayment || isDebtCollection) && (
            <div className="absolute z-10 w-full mt-1">
                <div className="flex justify-start gap-2 py-2 flex-wrap">
                    {suggestions.map(s => (
                        <button 
                            key={s} 
                            type="button" 
                            onMouseDown={() => handleSuggestionClick(s)} 
                            className="px-3 py-1 bg-slate-200 text-sm text-text-primary rounded-full hover:bg-secondary hover:text-white transition-colors"
                        >
                            {formatCurrency(s)}
                        </button>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
       <div>
        <label htmlFor="date" className="block text-sm font-medium text-text-secondary">Ngày</label>
        <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" required />
      </div>

      {(type === TransactionType.EXPENSE || type === TransactionType.INCOME) && (
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-text-secondary">Danh mục</label>
          <select id="category" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory | IncomeCategory)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm">
            {renderCategoryOptions()}
          </select>
        </div>
      )}

      {(isRepayment || isDebtCollection) && (
        <div>
          <label htmlFor="relatedTransactionId" className="block text-sm font-medium text-text-secondary">
              {isRepayment ? 'Trả cho khoản vay' : 'Thu nợ từ khoản cho vay'}
          </label>
          <select id="relatedTransactionId" value={relatedTransactionId} onChange={e => setRelatedTransactionId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" required>
             <option value="">-- Chọn khoản nợ --</option>
             {availableDebts.map(d => <option key={d.original.id} value={d.original.id}>{d.original.title} (Còn lại: {formatCurrency(d.remaining)})</option>)}
          </select>
        </div>
      )}
      
      {type === TransactionType.DEBT && (
        <>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
             <button type="button" onClick={() => setDebtType(DebtType.BORROWED)} className={`p-2 rounded-md font-semibold text-sm transition ${debtType === DebtType.BORROWED ? 'bg-white shadow text-text-primary' : 'text-text-secondary'}`}>Tôi vay</button>
             <button type="button" onClick={() => setDebtType(DebtType.LENT)} className={`p-2 rounded-md font-semibold text-sm transition ${debtType === DebtType.LENT ? 'bg-white shadow text-text-primary' : 'text-text-secondary'}`}>Tôi cho vay</button>
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-text-secondary">Hạn trả (tùy chọn)</label>
            <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
          </div>
        </>
      )}
      
      <div className={`flex justify-end gap-3 ${showSuggestions && suggestions.length > 0 ? 'pt-12' : 'pt-4'}`}>
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-text-secondary font-semibold rounded-lg hover:bg-slate-300 transition-colors">Hủy</button>
        <button type="submit" className="px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 transition-colors">Lưu</button>
      </div>
    </form>
  );
};

export default ExpenseForm;